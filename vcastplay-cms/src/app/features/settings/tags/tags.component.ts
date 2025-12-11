import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { TagService } from './tag.service';
import { Tag, TagValue } from './tag';

@Component({
  selector: 'app-tags',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.scss',
})
export class TagsComponent {

  pageInfo: MenuItem = [ {label: 'Settings'}, {label: 'Tags'} ];

  tagService = inject(TagService);
  message = inject(MessageService);

  isEditTag = signal<boolean>(false);
  isEditTagValue = signal<boolean>(false);

  showTagForm = signal<boolean>(false);
  showTagValueForm = signal<boolean>(false);

  selectedTag!: Tag | null;
  selectedTagValue!: TagValue | null;

  tagData: FormGroup = new FormGroup({
    id: new FormControl(0),
    name: new FormControl(null, [ Validators.required ]),
    description: new FormControl(null, [ Validators.required ]),
  });

  tagValueData: FormGroup = new FormGroup({
    id: new FormControl(0),
    value: new FormControl(null, [ Validators.required ]),
  });

  constructor() { }

  ngOnInit(): void {
    this.onLoadTags();
  }

  ngOnDestroy(): void {
    this.tagValues.set([]);
  }

  onLoadTags() {
    this.tagService.onLoadTags(1, 10);
  }

  onLoadTagValuesById(id: number) {
    this.tagValues.set([]);
    this.tagService.onLoadTagValuesById(id, 1, 10);
  }

  onSelectionChange(item: any, type: string) {
    if (!item) return;
    if (type === 'tags') {
      this.selectedTag = item;
      this.onLoadTagValuesById(item.id);
    }
  }

  onClearAll() {
    this.tagData.reset();
    this.tagValueData.reset();
    this.isEditTag.set(false);
    this.isEditTagValue.set(false);
  }

  onClickSave(type: string) {
    if (type === 'tags') {
      const { id: tagId, name, description } = this.tagData.value;
      if (this.tagData.invalid) {
        this.message.add({severity:'error', summary: 'Error', detail: 'All fields are required!' });
        return;
      };
      if (this.isEditTag()) {
        this.tagService.onSaveTags(tagId, { name, description }, 'update').subscribe({next: (res: any) => {
          const index = this.tags().findIndex((item: any) => item.id === tagId);
          if (index !== -1) this.tags()[index] = res;
          this.message.add({severity:'success', summary: 'Success', detail: 'Tag updated successfully!' });
          this.onClickCancel('tags');
        }});
      } else {
        this.tagService.onSaveTags(tagId, { name, description }, 'create').subscribe({next: (res: any) => {
          this.tags.set([...this.tags(), res]);
          this.message.add({severity:'success', summary: 'Success', detail: 'Tag created successfully!' });
          this.onClickCancel('tags');
        }});
      }
    } else {
      if (this.tagValueData.invalid) {
        this.message.add({severity:'error', summary: 'Error', detail: 'All fields are required!' });
        return;
      };
      const tagData: any = this.selectedTag;
      const { id, value } = this.tagValueData.value;
      
      if (this.isEditTagValue()) {
        this.tagService.onSaveTagValues(tagData.id, id, { value }, 'update').subscribe({next: (res: any) => {
          const index = this.tagValues().findIndex((item: any) => item.id === id && item.tagId === tagData.id);
          if (index !== -1) this.tagValues()[index] = res;
          this.message.add({severity:'success', summary: 'Success', detail: 'Tag Value updated successfully!' });
          this.onClickCancel('tag-values');
        }});
      } else {
        this.tagService.onSaveTagValues(tagData.id, id, { value }, 'create').subscribe({next: (res: any) => {
          this.tagValues.set([...this.tagValues(), res]);
          this.message.add({severity:'success', summary: 'Success', detail: 'Tag Value created successfully!' });
          this.onClickCancel('tag-values');
        }});
      }
    }
  }

  onClickEditTag(item: any, type: string) {
    if (type === 'tags') {
      this.isEditTag.set(true);
      this.showTagForm.set(true);
      this.tagData.patchValue(item);
    } else {
      this.isEditTagValue.set(true);
      this.showTagValueForm.set(true);
      this.tagValueData.patchValue(item);
    }
  }

  onClickRemoveTag(item: any, type: string) {
    if (type === 'tags') {
      this.tagService.onDeleteTags(item.id).subscribe({next: (res: any) => {
        const index = this.tags().findIndex((tag: any) => tag.id === item.id);
        if (index !== -1) this.tags().splice(index, 1);
        this.message.add({severity:'success', summary: 'Success', detail: 'Tag deleted successfully!' });
      }});
    } else {
      this.tagService.onDeleteTagValues(item.tagId, item.id).subscribe({next: (res: any) => {
        const index = this.tagValues().findIndex((tagValue: any) => tagValue.id === item.id && tagValue.tagId === item.tagId);
        if (index !== -1) this.tagValues().splice(index, 1);
        this.message.add({severity:'success', summary: 'Success', detail: 'Tag Value deleted successfully!' });
      }});
    }
  }

  onClickCancel(type: string) {
    if (type === 'tags') {
      this.isEditTag.set(false);
      this.showTagForm.set(false);
      this.tagData.reset();
    } else {
      this.isEditTagValue.set(false);
      this.showTagValueForm.set(false);
      this.tagValueData.reset();
    }
  }

  onPageChange(event: any, type: string) {
    const pageNumber = event.first / event.rows + 1;
    if (type === 'tags') {
      this.paginatedTag.currentPage = pageNumber;
      this.paginatedTag.itemsPerPage = event.rows;
      this.tagService.onLoadTags(pageNumber, event.rows);
    } else {
      const tagId = this.selectedTag ? this.selectedTag.id : 0;
      this.paginatedTagValue.currentPage = pageNumber;
      this.paginatedTagValue.itemsPerPage = event.rows;
      this.tagService.onLoadTagValuesById(tagId, pageNumber, event.rows);
    }
  }

  get tags() {
    return this.tagService.tags;
  }

  get paginatedTag() {
    return this.tagService.paginatedTags();
  }

  get tagLoading() {
    return this.tagService.tagLoading;
  }

  get tagValues() {
    return this.tagService.tagValues;
  }

  get paginatedTagValue() {
    return this.tagService.paginatedTagValues();
  }

  get tagValueLoading() {
    return this.tagService.tagValueLoading;
  }
}