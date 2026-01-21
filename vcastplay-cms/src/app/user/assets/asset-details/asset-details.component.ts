import { Component, HostListener, inject, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { UtilityService } from '../../../core/services/utility.service';
import { AssetsService } from '../assets.service';
import { CategoryService } from '../../settings/categories/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment.development';
import { StorageService } from '../../../core/services/storage.service';
import { Assets } from '../assets';
import { Category, SubCategory } from '../../settings/categories/category';
import { Pagination } from '../../../shared/interfaces/general';
import moment from 'moment';

@Component({
  selector: 'app-asset-details',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './asset-details.component.html',
  styleUrl: './asset-details.component.scss',
})
export class AssetDetailsComponent {

  pageInfo: MenuItem = [ {label: 'Asset Library'}, {label: 'Lists', routerLink: '/assets/asset-library'}, {label: 'Details'} ];

  utils = inject(UtilityService);
  assetService = inject(AssetsService);
  storage = inject(StorageService);
  categoryService = inject(CategoryService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  publicApi: string = environment.public;

  showScheduler = signal<boolean>(false);
  showAudienceTag = signal<boolean>(false);
  formBuilder = inject(FormBuilder);
  assetForm = this.formBuilder.group({
    id: [null],
    name: ['', Validators.required],
    type: ['', Validators.required],
    link: [''],
    categoryId: ['', Validators.required],
    subCategoryId: ['', Validators.required],
    orientation: ['', Validators.required],
    dimension: ['', Validators.required],
    sizeKb: [0],
    duration: [null, [Validators.required, Validators.pattern(/^([0-9]{2}):([0-5][0-9]):([0-5][0-9])$/)]],
    availability: [false],
    start: [null],
    end: [null],
    isAllDay: [false],
    isAllWeekdays: [false],
    weekdays: [[]],
    hours: [[]],
    audienceTags: [[]]
  }, { validators: [ this.assetService.dateRangeValidator(), this.assetService.durationValidator() ] });

  categoryOptions = {
    items: signal<Category[]>([]),
    loader: false,
    meta: signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 }),
    loadedPage: new Set<number>()
  }

  subCategoryOptions = {
    categoryId: 0,
    items: signal<SubCategory[]>([]),
    loader: false,
    meta: signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 }),
    loadedPage: new Set<number>()
  }

  constructor() { }
  
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedData()) $event.returnValue = true;
  }
  
  hasUnsavedData(): boolean {
    return this.assetForm.invalid && this.assetForm.dirty;
  }

  ngOnInit() {    
    this.onLoadCategories();
    this.route.queryParams.subscribe(params => {
      const { id } = params;
      this.onLoadAssetById(id);
    })
  }

  onLoadAssetById(id: number) {
    this.assetService.onGetAssetById(id).subscribe({
      next: (res: any) => {
        const { duration, ...rest } = res;
        // seconds to hh:mm:ss
        const time = this.utils.timeConversion(duration);
        const dateTime = this.assetService.onDateTimeConversions(rest);

        this.assetForm.patchValue({ ...rest, ...dateTime, duration: time, });
        if (res.categoryId) this.onLoadSubCategories(res.categoryId);
      },
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message })
    })
  }

  onLoadCategories(page: number = 1, limit: number = 10) {
    this.categoryOptions.loader = true;
    this.categoryService.onLoadCategory(page, limit).subscribe({
      next: (res: any) =>  {
        this.categoryOptions.meta.set(res.meta);
        this.categoryOptions.items.set(this.utils.onMergeVirtualPage(
          this.categoryOptions.items(),
          page,
          limit,
          res.meta.itemCount,
          res.items
        ));
      },
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.categoryOptions.loader = false
    })
  }

  onLazyLoadCategories(event: any) {

    this.subCategoryOptions.loadedPage.clear();
    this.subCategoryOptions.items.set([]);

    const total = this.categoryOptions.meta()?.itemsPerPage;
    const page = event.first + 1;    
    
    if (this.categoryOptions.loadedPage.has(page)) return;
    this.categoryOptions.loadedPage.add(page);
    this.onLoadCategories(page, total);
  }

  onLoadSubCategories(categoryId: number, page: number = 1, limit: number = 10) {
    // this.assetForm.get('subCategoryId')?.reset();
    this.subCategoryOptions.loader = true;
    this.subCategoryOptions.categoryId = categoryId;
    this.categoryService.onLoadSubCategory(categoryId, page, limit).subscribe({
      next: (res: any) =>  {
        this.subCategoryOptions.meta.set(res.meta);
        this.subCategoryOptions.items.set(this.utils.onMergeVirtualPage(
          this.subCategoryOptions.items(),
          page,
          limit,
          res.meta.itemCount,
          res.items
        ));
      },
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.subCategoryOptions.loader = false
    })
  }

  onLazyLoadSubCategories(event: any) {
    const { categoryId, meta } = this.subCategoryOptions;
    const total = meta()?.itemsPerPage;
    const page = event.first + 1;    
    
    if (this.subCategoryOptions.loadedPage.has(page)) return;
    this.subCategoryOptions.loadedPage.add(page);
    this.onLoadSubCategories(categoryId, page, total);
  }

  onAudienceTagChange(event: any) {    
    this.assetForm.patchValue({ audienceTags: event });
  }
  
  onChangeAvailability(event: any) {
    const checked = event.checked;
    if (!checked) {
      this.assetForm.get('start')?.reset();
      this.assetForm.get('end')?.reset();
      this.assetForm.get('allWeekdays')?.reset();
      this.assetForm.get('weekdays')?.reset();
      this.assetForm.get('hours')?.reset();
    }
  }

  onCloseSchedulerDialog() {
    const isAvailable = this.assetForm?.get('availability')?.value;
    const weekdays = this.assetForm?.get('weekdays')?.value || [];
    const hours = this.assetForm?.get('hours')?.value || [];
    if (isAvailable) {
      if (this.assetForm?.errors?.['startAfterEnd'] || weekdays.length === 0 || hours.length === 0) {
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Please input required fields (*)' });
        return;
      }
    } 
    this.showScheduler.set(false);
  }

  onClickSave(event: Event) {
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
        const { id, duration, ...data }: any = this.assetForm.value;
        // hh:mm:ss to seconds
        const time = this.utils.timeToSeconds(duration);
        const dateTime = this.assetService.onDateTimeConversions(data, true);        
        this.assetService.onUpdateAssets(id, { ...data, ...dateTime, duration: time }).subscribe({
          next: (res: any) => this.message.add({ severity:'success', summary: 'Success', detail: 'Asset updated successfully!' }),
          error: (err: any) => this.message.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Failed to update asset!' }),
          complete: () => {
            this.router.navigate([ '/assets/asset-library' ]);
            this.assetForm.reset();
          }
        });
      },
    })
  }

  onClickDelete(event: Event) {
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
        this.assetService.onDeleteAssets(this.asset).subscribe({
          next: (res: any) => this.message.add({ severity:'success', summary: 'Success', detail: 'User deleted successfully!' }),
          error: (err: any) => this.message.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Failed to delete user!' }),
          complete: () => {
            this.assetForm.reset();
            this.router.navigate([ '/assets/asset-library' ]);
          }
        });
      },
      reject: () => { }
    })
  }

  onClickCancel() {
    this.router.navigate([ '/assets/asset-library' ]);
  }

  get asset() {
    return this.assetForm.value as Assets;
  }

  get tenantId() {
    return this.storage.get('id');
  }

  get audienceTags() {
    return this.asset.audienceTags || [];
  }
}
