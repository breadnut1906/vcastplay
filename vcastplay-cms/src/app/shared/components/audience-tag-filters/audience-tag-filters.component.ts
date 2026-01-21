import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { TagService } from '../../../user/settings/tags/tag.service';
import { UtilityService } from '../../../core/services/utility.service';

@Component({
  selector: 'app-audience-tag-filters',
  imports: [ PrimengUiModule ],
  templateUrl: './audience-tag-filters.component.html',
  styleUrl: './audience-tag-filters.component.scss'
})
export class AudienceTagFiltersComponent {

  @Input() formGroup!: FormGroup;
  @Input() isShowAudienceTag = signal<boolean>(false);

  @Output() onAudienceTagChange = new EventEmitter<any>();

  tagService = inject(TagService);
  message = inject(MessageService);
  utils: any = inject(UtilityService);

  audienceTags = signal<any[]>([]);
  audienceTagInputForm: FormGroup = new FormGroup({
    tag: new FormControl(null, [ Validators.required ]),
    value: new FormControl(null, [ Validators.required ]),
  });

  categoryLists = signal<any[]>([]);

  constructor() { }

  ngOnInit() {
    this.onLoadTags();
  }

  ngOnDestroy() {
    this.tagValues.set([]);
  }

  ngAfterViewInit() { }

  onLoadTags() {
    // const { currentPage, itemsPerPage }: any = this.paginatedTag;
    this.tagService.onLoadTags(1, 10);
  }

  onLoadTagValuesById(id: number) {
    this.tagValues.set([]);
    // const { currentPage, itemsPerPage }: any = this.paginatedTagValue;
    this.tagService.onLoadTagValuesById(id, 1, 10);
  }

  onSelectionChange(event: any) {
    const groupId = this.tags().find((tag: any) => tag.id === event.value)?.id;
    this.onLoadTagValuesById(groupId);
  }

  onShowAudienceTag() {
    this.audienceTags.set(this.formGroup.get('audienceTags')?.value || []);
  }

  onHideAudienceTag() {
    this.audienceTagInputForm.reset();
  }

  onClickAddTag() {
    if (this.audienceTagInputForm.invalid) return;

    const tags: any[] = this.audienceTags();
    const { tag, value } = this.audienceTagInputForm.value;

    const tagData = this.tags().find(data => data.id == tag);
    const tagValue = this.tagValues().find(data => data.id == value);
    const audienceTagValue = { tag: tagData.name, tagValueId: tagValue.id, tagValue: tagValue.value };

    const index = tags.findIndex(data => data.tag == audienceTagValue.tag && data.tagValue == audienceTagValue.tagValue);

    if (index != -1) {
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Tag already added' });
      return;
    }    
    
    this.audienceTags.set([...tags, audienceTagValue])
    this.audienceTagInputForm.reset();
    this.tagValues.set([]);
  }

  onClickRemoveTag(item: any) {
    const tempData: any[] = this.audienceTags() || [];
    const index = tempData.findIndex(data => data.tag == item.tag && data.tagValue == item.tagValue);
    tempData.splice(index, 1);
    this.audienceTags.set([...tempData])
  }

  onClickApply() {
    this.onAudienceTagChange.emit(this.audienceTags());
    this.isShowAudienceTag.set(false);
  }

  get tags() {
    return this.tagService.tags;
  }

  get tagValues() {
    return this.tagService.tagValues;
  }

  get paginatedTag() {
    return this.tagService.paginatedTags();
  }

  get paginatedTagValue() {
    return this.tagService.paginatedTagValues();
  }
}
