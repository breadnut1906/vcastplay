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
import { Assets } from '../../../user/assets/assets';
import { Pagination } from '../../interfaces/general';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-content-selection',
  imports: [ PrimengUiModule, AssetFilterComponent, PlaylistFilterComponent, ScheduleFilterComponent
    , FiltersComponent ],
  templateUrl: './content-selection.component.html',
  styleUrl: './content-selection.component.scss'
})
export class ContentSelectionComponent {
  
  @Input() showContents = signal<boolean>(false);
  @Input() assetOnly: boolean = false;
  @Input() selectedTypes: string[] = [];
  @Input() selectionMode: 'single' | 'multiple' = 'single';
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
  message = inject(MessageService);
  
  selectionContent = signal<any>(null);
  contentLists = signal<Assets[] | any[]>([]);
  isLoading = signal<boolean>(false);
  pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });

  contentTypeControl: FormControl = new FormControl('asset');

  filtereContentTypes = computed(() => {    
    return this.selectedTypes.length > 0 ? this.contentTypes().filter(type => this.selectedTypes.includes(type.value)) : this.contentTypes();
  })
  
  constructor() {
    this.contentTypeControl.valueChanges.subscribe((value) => {
      this.selectionContent.set([]);
      this.onGetContents(value);
      this.contentType.emit(value);
    })
  }

  ngOnInit() { }

  onInitializedContents() {
    this.onGetContents('asset')
  }

  async onGetContents(type: string, page: number = 1, limit: number = 10): Promise<any> {
    this.isLoading.set(true);
    switch (type) {
      case 'playlist':
        return this.contentLists.set(this.playlistService.onGetPlaylists());
        // break;
      case 'design':
        return this.contentLists.set(this.designLayoutService.onGetDesigns());
        // break;
      case 'schedule':
        return this.contentLists.set(this.scheduleService.onGetSchedule());
        // break;
      case 'clipart':
        return this.contentLists.set(this.cliparts);
        // break;
      default:
        this.assetService.onLoadAssets(page, limit).subscribe({
          next: (res: any) => {
            const { items, meta } = res;
            this.contentLists.set(items);
            this.pagination.set(meta);
          },
          error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
          complete: () => this.isLoading.set(false)
        });       
        break;
    }
  }

  onFilterChange(event: any) {
    const { filters, audienceTag } = event
    // this.filterSignal.set(filters);    
    // this.audienceTagSignal.set(audienceTag ?? {});
  }
  
  onSelectionChange(event: any) {    
    this.selectedContents.emit(event);
  }

  onPageChange(event: any) {
    const type = this.contentTypeControl.value;
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.pagination();
    this.pagination.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.onGetContents(type, pageNumber, rows);
  }

  get contentTypes() { return this.scheduleService.contentTypes; }
  get calendarSelectedDate() { return this.scheduleService.calendarSelectedDate; }
  
  get cliparts() { return this.designLayoutService.cliparts; }
}
