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

  @Input() isShowAudienceTag = signal<boolean>(false);

  @Output() onAudienceTagChange = new EventEmitter<any>();

  tagService = inject(TagService);
  message = inject(MessageService);
  utils: any = inject(UtilityService);

  audienceTags: any[] = [];
  audienceTagInputForm: FormGroup = new FormGroup({
    tags: new FormControl(null, [ Validators.required ]),
    tagValue: new FormControl(null, [ Validators.required ]),
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
    const groupId = this.tags().find((tag: any) => tag.name === event.value)?.id;
    this.onLoadTagValuesById(groupId);
  }

  onHideAudienceTag() {
    this.audienceTagInputForm.reset(); 
    this.audienceTags = [];
  }

  onClickAddTag() {
    if (this.audienceTagInputForm.invalid) return;

    const tags = this.audienceTags;
    const tag = this.audienceTagInputForm.value;

    const index = tags.findIndex(data => data.name == tag.name && data.tagValue == tag.tagValue);

    if (index != -1) {
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Tag already added' });
      return;
    }

    this.audienceTags = [...tags, tag];
    this.audienceTagInputForm.reset();
    this.tagValues.set([]);
  }

  onClickRemoveTag(item: any) {
    const tempData = this.audienceTags;
    const index = tempData.findIndex(data => data.name == item.name && data.tagValue == item.tagValue);
    tempData.splice(index, 1);
    this.audienceTags = [...tempData];
  }

  onClickApply() {
    this.onAudienceTagChange.emit(this.audienceTags);
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
