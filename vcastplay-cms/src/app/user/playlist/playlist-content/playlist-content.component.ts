import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { AssetsService } from '../../assets/assets.service';
import { Assets } from '../../assets/assets';
import { Pagination } from '../../../shared/interfaces/general';
import { MenuItem, MessageService } from 'primeng/api';
import { FormControl } from '@angular/forms';
import { FiltersComponent } from '../../../shared/components/filters/filters.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { UtilityService } from '../../../core/services/utility.service';

@Component({
  selector: 'app-playlist-content',
  imports: [ PrimengUiModule, FiltersComponent, PaginatorComponent ],
  templateUrl: './playlist-content.component.html',
  styleUrl: './playlist-content.component.scss'
})
export class PlaylistContentComponent {

  @Output() onPlaylistContentChange = new EventEmitter<any>();

  assetService = inject(AssetsService);
  message = inject(MessageService);
  utils = inject(UtilityService);

  contentType: FormControl = new FormControl<string>('asset');
  contentOptions: MenuItem[] = [
    { label: 'Asset', value: 'asset' },
    // { label: 'Design Layout', value: 'layout' },
  ]

  contentLists = signal<Assets[] | any[]>([]);
  selectedContent = signal<Assets | any>(null);
  isLoading = signal<boolean>(false);
  pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });

  ngOnInit() {
    this.onInitializeContent('asset');
  }

  onInitializeContent(contentType: 'asset' | 'layout', page: number = 1, limit: number = 10) {
    this.isLoading.set(true);
    if (contentType == 'asset') {
      this.assetService.onLoadAssets(page, limit).subscribe({
        next: (res: any) => {
          this.contentLists.set(res.items);
          this.pagination.set(res.meta);
        }, 
        error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
        complete: () => this.isLoading.set(false)
      })
    }
  }
  
  onPageChange(event: any) {
    const type = this.contentType.value;
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.pagination();
    this.pagination.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.onInitializeContent(type, pageNumber, event.rows);
  }

  onClickAddContent(content: any) {
    this.onPlaylistContentChange.emit({
      type: this.contentType.value, // asset or layout
      duration: content.duration,
      assetId: content.id,
      asset: {
        type: content.type,
        name: content.name
      }
    });
  }

  get paginate() { return this.pagination() }
}
