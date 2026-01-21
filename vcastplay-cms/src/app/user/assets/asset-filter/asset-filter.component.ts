import { ChangeDetectorRef, Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { AssetsService } from '../assets.service';
import { UtilityService } from '../../../core/services/utility.service';
import { CategoryService } from '../../settings/categories/category.service';
import { LazyLoadEvent, ScrollerOptions } from 'primeng/api';
import { AudienceTagFiltersComponent } from '../../../shared/components/audience-tag-filters/audience-tag-filters.component';

@Component({
  selector: 'app-asset-filter',
  imports: [ PrimengUiModule, AudienceTagFiltersComponent ],
  templateUrl: './asset-filter.component.html',
  styleUrl: './asset-filter.component.scss'
})
export class AssetFilterComponent {

  @Output() filterChange = new EventEmitter<any>();

  utils = inject(UtilityService);
  assetService = inject(AssetsService);
  categoryService = inject(CategoryService);
  cdr = inject(ChangeDetectorRef);

  isShowAudienceTag = signal<boolean>(false);

  useFilter = signal<boolean>(false);
  
  categories = signal<any[]>([]);
  subCategories = signal<any[]>([]);
  loadedCategories = new Set<number>();
  loadedSubCategories = new Set<number>();
  categoryOptions: ScrollerOptions = {
    delay: 250,
    showLoader: true,
    lazy: true,
    onLazyLoad: this.onLazyLoadCategories.bind(this)
  }
  subCategoryOptions: ScrollerOptions = {
    delay: 250,
    showLoader: true,
    lazy: true,
    onLazyLoad: this.onLazyLoadSubCategories.bind(this)
  }

  ngOnInit() {
    this.onLoadCategories();
  }

  ngOnDestroy() {
    this.subCategories.set([]);
  }

  onLoadCategories() {
    this.categoryService.onLoadCategories(1, 10).then((result: any) => {
      this.loadedCategories.add(1);
      this.categories.set(result);
      this.cdr.detectChanges();
    });
  }

  onLoadSubCategoriesById(id: number) {
    this.subCategories.set([]);
    if (!id) return;
    this.categoryService.onLoadSubCategoriesById(id, 1, 10);
  }

  onClickApply(filter: any) {
    const filters = this.assetFilterForm.value;
    this.filterChange.emit(filters);
    this.useFilter.set(true);
    filter.hide();
  }

  onClickClear(filter: any) {
    this.assetFilterForm.reset();
    this.filterChange.emit({ ...this.assetFilterForm.value });
    this.useFilter.set(false);
    filter.hide();
  }

  onClickCloseAudienceTag() {
    this.isShowAudienceTag.set(false);
  }

  onClickApplyAudienceTag() {
    const filters = this.assetFilterForm.value;
    this.isShowAudienceTag.set(false);
    this.filterChange.emit(filters);
  }

  onAudienceTagChange(event: any) {
    this.assetFilterForm.patchValue({ audienceTags: event });
  }
  
  onLazyLoadCategories(event: LazyLoadEvent | any) {
    const { itemsPerPage } = this.categoryService.paginatedCategories();
    const threshold = 5;
    const loaded = this.categories().length;
    const visibleEnd = (event.first ?? 0) + itemsPerPage;

    // user scrolled near the end of loaded data
    if (visibleEnd < loaded - threshold) return;

    const page = Math.floor(loaded / itemsPerPage) + 1;    
    
    if (this.loadedCategories.has(page)) return;
    this.loadedCategories.add(page);
    this.categoryService.onLoadCategories(page, itemsPerPage).then((result: any) => {
      this.categories.update(current => [ ...current, ...result ]);      
      this.cdr.detectChanges();
    });
  }

  onLazyLoadSubCategories(event: LazyLoadEvent | any) {
    const { itemsPerPage } = this.categoryService.paginatedSubCategories();
    const threshold = 5;
    const loaded = this.subCategories().length;
    const visibleEnd = (event.first ?? 0) + itemsPerPage;
    // user scrolled near the end of loaded data
    if (visibleEnd < loaded - threshold) return;
    const page = Math.floor(loaded / itemsPerPage) + 1;

    if (this.loadedSubCategories.has(page)) this.loadedSubCategories.delete(page);
    this.loadedSubCategories.add(page);
    const categoryId = this.formControl('category').value;
    this.categoryService.onLoadSubCategoriesById(categoryId, page, itemsPerPage).then((result: any) => {
      this.subCategories.set(result)
      this.cdr.detectChanges();
    });
  }
  
  formControl(fieldName: string) {
    return this.utils.getFormControl(this.assetFilterForm, fieldName);
  }

  get keywords() { return this.assetFilterForm.get('keyword'); }
  
  get assetFilterForm() { return this.assetService.assetFilterForm; }

  get fileTypes() { return this.utils.fileTypes; }
  get orientations() { return this.utils.orientations; }


  get paginatedCategory() {
    return this.categoryService.paginatedCategories();
  }

  get categoryLoading() {
    return this.categoryService.categoryLoading;
  }

  get paginatedSubCategory() {
    return this.categoryService.paginatedSubCategories();
  }

  get subCategoryLoading() {
    return this.categoryService.subCategoryLoading;
  }
}
