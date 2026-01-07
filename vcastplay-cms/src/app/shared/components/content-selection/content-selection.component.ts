import { Component, computed, EventEmitter, inject, Input, Output, signal, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FiltersComponent } from '../filters/filters.component';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { AssetFilterComponent } from '../../../user/assets/asset-filter/asset-filter.component';
import { PlaylistFilterComponent } from '../../../user/playlist/playlist-filter/playlist-filter.component';
import { ScheduleFilterComponent } from '../../../user/schedules/schedule-filter/schedule-filter.component';
import { AssetsService } from '../../../user/assets/assets.service';
import { PlaylistService } from '../../../user/playlist/playlist.service';
import { DesignLayoutService } from '../../../user/design-layout/design-layout.service';
import { SchedulesService } from '../../../user/schedules/schedules.service';
import { UtilityService } from '../../../core/services/utility.service';

@Component({
  selector: 'app-content-selection',
  imports: [ PrimengUiModule, AssetFilterComponent, PlaylistFilterComponent, ScheduleFilterComponent
    , FiltersComponent ],
  templateUrl: './content-selection.component.html',
  styleUrl: './content-selection.component.scss'
})
export class ContentSelectionComponent {
  
  @Input() assetOnly: boolean = false;
  @Input() selectedTypes: string[] = [];
  @Input() selectionMode: 'single' | 'multiple' = 'single';
  @Input() selectionContent = signal<any>(null);
  @Input() isSelectable: boolean = true;
  @Input() readonly: boolean = false;
  @Input() includeDesignLayoutWithPlaylist: boolean = false;

  @Output() contentType = new EventEmitter<any>();
  @Output() selectedContents = new EventEmitter<any>();

  assetService = inject(AssetsService);
  playlistService = inject(PlaylistService);
  designLayoutService = inject(DesignLayoutService);
  scheduleService = inject(SchedulesService);
  utils = inject(UtilityService);
  
  contentLists = signal<any[]>([]);

  contentTypeControl: FormControl = new FormControl('asset');
  
  filterSignal = signal<any>({});
  audienceTagSignal = signal<any>({});
  filteredContentLists = computed(() => {
    const contents = this.contentLists();
    const { keywords, status, category, subCategory, type, orientation, isAuto } = this.filterSignal();
    const hasAnyValue = Object.values(this.audienceTagSignal()).some(arr => Array.isArray(arr) && arr.length > 0);
    const filteredItems = this.utils.onFilterItems(contents, this.audienceTagSignal());

    const data = hasAnyValue ? filteredItems : contents;
    
    const filteredContents = data.filter((content: any) => {
      const matchKeywords = !keywords || content.name?.toLowerCase().includes(keywords.toLowerCase()) || content.description?.toLowerCase().includes(keywords.toLowerCase());
      const matchStatus = !status || (content.status == status);
      const matchCategory = !category || content.category?.toLowerCase().includes(category.toLowerCase());
      const matchSubCategory = !subCategory || content.subCategory?.toLowerCase().includes(subCategory.toLowerCase());
      const matchType = !type || content.type?.toLowerCase().includes(type.toLowerCase());
      const matchOrientation = !orientation || content.displaySettings.orientation?.toLowerCase().includes(orientation.toLowerCase());
      const matchIsAuto = isAuto == null || content.isAuto == isAuto;
      const matchHasPlaylist = !content.hasPlaylist;

      if (this.includeDesignLayoutWithPlaylist) return matchKeywords && matchStatus && matchCategory && matchSubCategory && matchType && matchOrientation && matchIsAuto;
      else return matchKeywords && matchStatus && matchCategory && matchSubCategory && matchType && matchOrientation && matchIsAuto && matchHasPlaylist;
    })

    return filteredContents;
  })

  filtereContentTypes = computed(() => {    
    return this.selectedTypes.length > 0 ? this.contentTypes().filter(type => this.selectedTypes.includes(type.value)) : this.contentTypes();
  })
  
  constructor() {
    this.contentTypeControl.valueChanges.subscribe((value) => {      
      this.filterSignal.set({});
      this.audienceTagSignal.set({});
      this.selectionContent.set([]);
      this.onGetContents(value);
      this.contentType.emit(value);
    })
  }

  ngOnInit() {
    this.onGetContents('asset');    
  }

  onGetContents(type: string) {
    switch (type) {
      case 'playlist':
        this.contentLists.set(this.playlistService.onGetPlaylists());
        break;
      case 'design':
        this.contentLists.set(this.designLayoutService.onGetDesigns());
        break;
      case 'schedule':
        this.contentLists.set(this.scheduleService.onGetSchedule());
        break;
      case 'clipart':
        this.contentLists.set(this.cliparts);
        break;
      default:
        this.contentLists.set(this.assetService.onGetAssets());
        break;
    }
  }

  onFilterChange(event: any) {
    const { filters, audienceTag } = event
    this.filterSignal.set(filters);    
    this.audienceTagSignal.set(audienceTag ?? {});
  }
  
  onSelectionChange(event: any) {    
    this.selectedContents.emit(event);
  }

  get contentTypes() { return this.scheduleService.contentTypes; }
  get calendarSelectedDate() { return this.scheduleService.calendarSelectedDate; }
  
  get cliparts() { return this.designLayoutService.cliparts; }
}
