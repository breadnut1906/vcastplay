import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { UtilityService } from '../../../core/services/utility.service';
import { AssetsService } from '../assets.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { TagService } from '../../settings/tags/tag.service';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { CategoryService } from '../../settings/categories/category.service';

@Component({
  selector: 'app-asset-details',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './asset-details.component.html',
  styleUrl: './asset-details.component.scss',
})
export class AssetDetailsComponent {

  pageInfo: MenuItem = [ {label: 'Asset Library'}, {label: 'Lists', routerLink: '/assets/asset-library'}, {label: 'Details'} ];

  utils = inject(UtilityService);
  tagService = inject(TagService);
  assetService = inject(AssetsService);
  cagetoryService = inject(CategoryService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  
  files: any[] = [];
  totalSize : number = 0;
  totalSizePercent : number = 0;

  previewUrl = signal<string>('');

  isShowSchedule = signal<boolean>(false);
  isShowAudienceTag = signal<boolean>(false);
  isShowInfo = signal<boolean>(false);

  allowedLinks: string[] = [ 'web', 'widget', 'youtube', 'facebook' ];

  isShowCategoryForm = signal<boolean>(false);
  isShowSubCategoryForm = signal<boolean>(false);
  categoryForm: FormGroup = new FormGroup({
    name: new FormControl(null),
    description: new FormControl(null)
  })  
  
  showLinkInput = () => {
    const type = this.assetTypeControl.value;
    return this.allowedLinks.includes(type);
  }
  
  hasUnsavedChanges!: () => boolean;

  constructor() { }
  
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedData()) {
      $event.returnValue = true;
    }
  }
  
  ngOnInit() { 
    if (!this.isEditMode()) this.assetTypeControl.enable();
    const type = this.formControl('type').value;
    this.assetTypeControl.patchValue(this.allowedLinks.includes(type) ? type : 'file');

    this.onLoadCategories();
  }

  ngOnDestroy() {
    this.assetForm.reset();
    this.isEditMode.set(false);
    this.selectedAsset.set(null);
    this.assetTypeControl.reset();
  }
  
  hasUnsavedData(): boolean {
    return this.assetForm.invalid;
  }

  onLoadCategories() {
    this.cagetoryService.onLoadCategories(1, 10);
  }

  onLoadSubCategoriesById(id: number) {
    if (!id) return;
    this.formControl('subCategory').reset();
    this.cagetoryService.onLoadSubCategoriesById(id);
  }

  onChangeType(event: any) {
    const type = event.value;
    if (this.allowedLinks.includes(type)) {
      this.formControl('orientation').enable();
      this.assetForm.patchValue({ type, name: null, link: null })
    } else {
      this.formControl('orientation').disable();
      this.assetForm.reset();
    }
  }
  
  async onDropFile(event: DragEvent) {
    event.preventDefault();
    if (this.showLinkInput()) return;
    try {
      const files = Array.from(event.dataTransfer?.files || []);    

      const file = files[0];
      const result = await this.assetService.processFile(file);
      
      if (result) {
        this.assetForm.patchValue(result);
      }
    } catch (error: any) {
      this.message.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to process file' });
      this.assetForm.reset();
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  async onFileSelected(event: Event) {
    const MAX_SIZE = 300 * 1024 * 1024; // 300MB
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      this.message.add({ severity: 'error', summary: 'Error', detail: 'File size should be less than 300MB' });
      return;
    }
    
    try {
      const result = await this.assetService.processFile(file);      
      
      if (result) {
        this.assetForm.patchValue(result);
      }
    } catch (error: any) {
      this.message.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to process file' });
      this.assetForm.reset();
    }
  }

  async onPropertiesChange(event: any) {
    if (!event) return;
    const { title, width, height, orientation, duration, type } = event;
    this.assetForm.patchValue({ 
      duration, 
      fileDetails: {
        name: title ?? '',
        size: 0,
        type,
        orientation,
        resolution: { width, height }
      } 
    });
  }

  async onClickSave(event: Event) {
    if (this.assetForm.invalid) {
      this.assetForm.markAllAsTouched();
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Please input required fields (*)' });
      return;
    }

    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to save changes?',
      closable: true,
      closeOnEscape: true,
      header: 'Confirm Save',
      icon: 'pi pi-question-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Save',
      },
      accept: () => {
        console.log(this.assetForm.value);
        this.message.add({ severity: 'success', summary: 'Success', detail: 'Assets upload successfully!' });
        this.assetService.onSaveAssets(this.assetForm.value);
        this.router.navigate(['/assets/asset-library']);
      },
    });
  }

  onClickDelete(item: any, event: Event) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this asset?',
      closable: true,
      closeOnEscape: true,
      header: 'Danger Zone',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        this.assetService.onDeleteAssets(item);
        this.message.add({ severity:'success', summary: 'Success', detail: 'User deleted successfully!' });
        this.router.navigate([ '/assets/asset-library' ]);
      },
      reject: () => { }
    })
  }

  onSaveCategory(type: string) {
    const categoryId = this.formControl('category').value;
    if (type == 'category') {
      this.cagetoryService.onSaveCategories(categoryId, this.categoryForm.value).subscribe({
        next: (res: any) => {
          this.message.add({ severity:'success', summary: 'Success', detail: 'Category updated successfully!' }),
          this.cagetoryService.categories().push(res);
        },
        error: () => this.message.add({ severity:'error', summary: 'Error', detail: 'Failed to update category!' }),
        complete: () => {
          this.isShowCategoryForm.set(false);
          this.categoryForm.reset();
        }
      });
    } else {
      this.cagetoryService.onSaveSubCategories(categoryId, 0, this.categoryForm.value).subscribe({
        next: (res: any) => {
          this.message.add({ severity:'success', summary: 'Success', detail: 'Sub Category updated successfully!' }),
          this.cagetoryService.subCategories().push(res);
        },
        error: () => this.message.add({ severity:'error', summary: 'Error', detail: 'Failed to update sub category!' }),
        complete: () => {
          this.isShowSubCategoryForm.set(false);
          this.categoryForm.reset();
        }
      });
    }
  }
  
  onClickCancel() {
    this.router.navigate([ '/assets/asset-library' ]);
  }

  onClickClear() {
    this.assetForm.patchValue({ link: null, name: null, duration: 10 })
  }

  onClickCloseSchedule() {
    const isAvailable = this.availability?.value;
    const weekdays = this.weekdays?.value;
    const hours = this.hours?.value;
    if (isAvailable) {
      if (this.assetForm?.errors?.['startAfterEnd'] || weekdays.length === 0 || hours.length === 0) {
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Please input required fields (*)' });
        return;
      }
    } 
    this.isShowSchedule.set(false);
  }

  onAudienceTagChange(event: any) {
    this.assetForm.patchValue({ audienceTag: event });
  }
  
  onChangeAvailability(event: any) {
    const checked = event.checked;
    if (!checked) {
      this.formControl('start')?.reset();
      this.formControl('end')?.reset();
      this.formControl('allWeekdays')?.reset();
      this.weekdays?.reset();
      this.hours?.reset();
    }
  }

  formControl(fieldName: string) {
    return this.utils.getFormControl(this.assetForm, fieldName);
  }

  get orientations() { return this.utils.orientations; }

  get isEditMode() { return this.assetService.isEditMode; }
  get isLoading() { return this.assetService.isLoading; }
  get selectedAsset() { return this.assetService.selectedAsset; }
  get assetForm() { return this.assetService.assetForm; }
  get assetTypes() { return this.assetService.assetType; }
  get assetTypeControl() { return this.assetService.assetTypeControl; }

  get type() { return this.assetForm.get('type'); }
  get availability() { return this.assetForm.get('availability'); }
  get weekdays() { return this.assetForm.get('weekdays'); }
  get hours() { return this.assetForm.get('hours'); }

  get categories() { return this.cagetoryService.categories; }
  get subCategories() { return this.cagetoryService.subCategories; }
}
