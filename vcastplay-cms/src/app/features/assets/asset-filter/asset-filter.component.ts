import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { AssetsService } from '../assets.service';
import { UtilityService } from '../../../core/services/utility.service';
import { AudienceTagFiltersComponent } from '../../../components/audience-tag-filters/audience-tag-filters.component';
import { TagService } from '../../settings/tags/tag.service';
import { CategoryService } from '../../settings/categories/category.service';

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

  audienceTag: any;
  isShowAudienceTag = signal<boolean>(false);

  useFilter = signal<boolean>(false);

  ngOnInit() {
    this.onLoadCategories();
  }

  ngOnDestroy() {
    this.subCategories.set([]);
  }

  onLoadCategories() {
    this.categoryService.onLoadCategories(1, 10);
  }

  onLoadSubCategoriesById(id: number) {
    this.subCategories.set([]);
    if (!id) return;
    this.categoryService.onLoadSubCategoriesById(id, 1, 10);
  }

  onClickApply(filter: any) {
    const filters = this.assetFilterForm.value;
    const audienceTag = this.audienceTag
    this.filterChange.emit({ filters, audienceTag });
    this.useFilter.set(true);
    filter.hide();
  }

  onClickClear(filter: any) {
    this.assetFilterForm.reset();
    this.audienceTag = null;
    this.filterChange.emit({ filters: this.assetFilterForm.value, audienceTag: {} });
    this.useFilter.set(false);
    filter.hide();
  }

  onClickCloseAudienceTag() {
    this.isShowAudienceTag.set(false);
  }

  onClickApplyAudienceTag() {
    const filters = this.assetFilterForm.value;
    const audienceTag = this.audienceTag;
    this.isShowAudienceTag.set(false);
    this.filterChange.emit({ filters, audienceTag });
  }

  onAudienceTagChange(event: any) {
    this.audienceTag = event;
  }

  get keywords() { return this.assetFilterForm.get('keyword'); }
  
  get assetFilterForm() { return this.assetService.assetFilterForm; }

  get fileTypes() { return this.utils.fileTypes; }
  get orientations() { return this.utils.orientations; }

  
  get categories() {
    return this.categoryService.categories;
  }

  get paginatedCategory() {
    return this.categoryService.paginatedCategories();
  }

  get categoryLoading() {
    return this.categoryService.categoryLoading;
  }

  get subCategories() {
    return this.categoryService.subCategories;
  }

  get paginatedSubCategory() {
    return this.categoryService.paginatedSubCategories();
  }

  get subCategoryLoading() {
    return this.categoryService.subCategoryLoading;
  }
}
