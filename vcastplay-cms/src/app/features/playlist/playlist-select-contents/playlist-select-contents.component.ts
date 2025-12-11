import { Component, computed, effect, EventEmitter, inject, Input, Output } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { AssetsService } from '../../assets/assets.service';
import { FormGroup } from '@angular/forms';
import { AudienceTagFiltersComponent } from '../../../components/audience-tag-filters/audience-tag-filters.component';
import { PlaylistService } from '../playlist.service';
import { TagService } from '../../settings/tags/tag.service';
import { AssetListItemComponent } from '../../assets/asset-list-item/asset-list-item.component';
import { Assets } from '../../assets/assets';

@Component({
  selector: 'app-playlist-select-contents',
  imports: [ PrimengUiModule, AudienceTagFiltersComponent, AssetListItemComponent ],
  templateUrl: './playlist-select-contents.component.html',
  styleUrl: './playlist-select-contents.component.scss'
})
export class PlaylistSelectContentsComponent {

  @Input() playListForm!: FormGroup;
  @Input() steps: number = 2;
  @Input() showCategory: boolean = true;
  @Output() assetSelected = new EventEmitter<Assets[]>();

  assetService = inject(AssetsService);
  playListService = inject(PlaylistService);
  tagService = inject(TagService);
  
  filterCategory = computed(() => {
    return null //this.tagsLists().find(tag => tag.id.includes('categories')).data();
  })

  filterSubCategory = computed(() => {
    return null //this.tagsLists().find(tag => tag.id.includes('subCategories')).data();
  })

  constructor() {
    effect(() => {
      const activeStep = this.activeStep();      
      if (activeStep === 2) this.onFilteredAssets();      
    })
  }

  onFilteredAssets() {
    const assets = this.assetService.onGetAssets();

    // Category and Sub Category Filter
    const filteredItems = assets.filter((item: Assets) => {
      const { category, subCategory } = this.categoryForm.value;

      const matchesCategory = category ? item.category?.toLowerCase().includes(category?.toLowerCase().trim()) : false;
      const matchesSubCategory = subCategory ? item.subCategory?.toLowerCase().includes(subCategory?.toLowerCase().trim()) : false;

      if (!category && !subCategory) return true;

      return matchesCategory || matchesSubCategory;
    });

    const audienceTag: any = null //this.audienceTagForm.value.audienceTag;
    const hasValues = Object.values(audienceTag).some((arr: any) => Array.isArray(arr) && arr.length > 0);
    const filtered = this.filterItems(filteredItems, audienceTag);    
    
    // If audience tag is not selected
    if (!hasValues) {
      this.filteredAssets.set(filteredItems);
      this.assetSelected.emit(this.filteredAssets());
      return;
    }

    this.filteredAssets.set(filtered);
    this.assetSelected.emit(this.filteredAssets());
  }
  
  private filterItems(data: any[], filters: any) {
    const activeKeys = Object.keys(filters).filter(key => filters[key]?.length);

    return data.filter(item => {
      const tag = item.audienceTag;

      return activeKeys.some(key => {
        const filterValues = filters[key];
        const value = tag[key];

        if (Array.isArray(value)) {
          return value.some((v: any) => filterValues.includes(v));
        }

        return filterValues.includes(value);
      });
    });
  }

  formControl(fieldName: string) {
    return this.playListForm.get(fieldName) as FormGroup;
  }

  get activeStep() { return this.playListService.activeStep; }
  get filteredAssets() { return this.playListService.filteredAssets; }
  get categoryForm() { return this.playListService.categoryForm; }

  get audienceTagForm() { return null } //this.tagService.audienceTagForm; }

  get tagsLists() { return [] } //this.tagService.tagsLists; }
}
