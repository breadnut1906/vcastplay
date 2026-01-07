import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { TagService } from './tag.service';
import { Tag, TagValue } from './tag';
import { UtilityService } from '../../../core/services/utility.service';

@Component({
  selector: 'app-tags',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.scss',
})
export class TagsComponent {

  pageInfo: MenuItem = [ {label: 'Settings'}, {label: 'Tags'} ];

  utils = inject(UtilityService);
  tagService = inject(TagService);
  confirmation = inject(ConfirmationService);
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

  onClickSave(event: Event, type: string) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to save changes?',
      closable: true,
      closeOnEscape: true,
      header: 'Confirm Save',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Save',
      },
      accept: () => {
        if (type === 'tags') this.onSaveTag();
        else this.onSaveTagValue();
      }
    })
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

  onClickRemoveTag(event: Event, item: any, type: string) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this tag?',
      header: 'Danger Zone',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true, },
      acceptButtonProps: { label: 'Delete', severity: 'danger', },
      accept: () => {
        if (type === 'tags') {
          this.onRemoveTag(item);
        } else {
          this.onRemoveTagValue(item);
        }
      }
    })
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

  onSaveTag() {
    if (this.tagData.invalid) {
      this.tagData.markAllAsTouched();
      this.message.add({severity:'error', summary: 'Error', detail: 'All fields are required!' });
      return;
    };

    const { id: tagId, name, description } = this.tagData.value;
    const mode = this.isEditTag() ? 'update' : 'create';

    this.tagService.onSaveTags(tagId, { name, description }, mode).subscribe({
      next: (res: any) => {
        if (mode === 'create') this.tags.set([...this.tags(), res]);
        else {
          const index = this.tags().findIndex((item: any) => item.id === tagId);
          if (index !== -1) this.tags()[index] = res;
        }
        this.message.add({severity:'success', summary: 'Success', detail: 'Tag saved successfully!' });
      },
      error: (err: any) => this.message.add({severity:'error', summary: 'Error', detail: err.error.message }),
      complete: () => this.onClickCancel('tags')
    });
  }

  onSaveTagValue() {
    if (this.tagValueData.invalid) {
      this.tagValueData.markAllAsTouched();
      this.message.add({severity:'error', summary: 'Error', detail: 'All fields are required!' });
      return;
    };
    const tagData: any = this.selectedTag;
    const { id, value } = this.tagValueData.value;
    const mode = this.isEditTagValue() ? 'update' : 'create';

    this.tagService.onSaveTagValues(tagData.id, id, { value }, mode).subscribe({
      next: (res: any) => {
        if (mode === 'create') this.tagValues.set([...this.tagValues(), res]);
        else {
          const index = this.tagValues().findIndex((item: any) => item.id === id && item.tagId === tagData.id);
          if (index !== -1) this.tagValues()[index] = res;
        }
        this.message.add({severity:'success', summary: 'Success', detail: 'Tag Value saved successfully!' });
      },
      error: (err: any) => {
        this.message.add({severity:'error', summary: 'Error', detail: err.error.message });
      },
      complete: () => {
        this.onClickCancel('tag-values');
      }
    });
  }

  onRemoveTag(item: any) {
    this.tagService.onDeleteTags(item.id).subscribe({next: (res: any) => {
      const index = this.tags().findIndex((tag: any) => tag.id === item.id);
      if (index !== -1) this.tags().splice(index, 1);
      this.message.add({severity:'success', summary: 'Success', detail: 'Tag deleted successfully!' });
    }});
  }

  onRemoveTagValue(item: any) {
    this.tagService.onDeleteTagValues(item.tagId, item.id).subscribe({next: (res: any) => {
      const index = this.tagValues().findIndex((tagValue: any) => tagValue.id === item.id && tagValue.tagId === item.tagId);
      if (index !== -1) this.tagValues().splice(index, 1);
      this.message.add({severity:'success', summary: 'Success', detail: 'Value deleted successfully!' });
    }});
  }

  onPageChange(event: any, type: string) {
    const rows = event.rows;
    const pageNumber = event.first / rows + 1;
    if (type === 'tags') {
      const { currentPage, itemsPerPage, ...meta } = this.paginatedTag();
      this.paginatedTag.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
      this.tagService.onLoadTags(pageNumber, rows);
    } else {
      const tagId = this.selectedTag ? this.selectedTag.id : 0;
      const { currentPage, itemsPerPage, ...meta } = this.paginatedTagValue();
      this.paginatedTagValue.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
      this.tagService.onLoadTagValuesById(tagId, pageNumber, rows);
    }
  }

  get tags() {
    return this.tagService.tags;
  }

  get paginatedTag() {
    return this.tagService.paginatedTags;
  }

  get tagLoading() {
    return this.tagService.tagLoading;
  }

  get tagValues() {
    return this.tagService.tagValues;
  }

  get paginatedTagValue() {
    return this.tagService.paginatedTagValues;
  }

  get tagValueLoading() {
    return this.tagService.tagValueLoading;
  }
}