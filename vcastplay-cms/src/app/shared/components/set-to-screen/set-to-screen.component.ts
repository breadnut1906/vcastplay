import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { Schedule } from '../../../user/schedules/schedules';
import { Playlist } from '../../../user/playlist/playlist';
import { Screen, ScreenItems } from '../../../user/screens/screen';
import { Pagination } from '../../interfaces/general';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ScreenService } from '../../../user/screens/screen.service';
import { PaginatorComponent } from '../paginator/paginator.component';
import { UtilityService } from '../../../core/services/utility.service';
import { HttpEventType } from '@angular/common/http';
import { FiltersComponent } from '../filters/filters.component';

@Component({
  selector: 'app-set-to-screen',
  imports: [ PrimengUiModule, PaginatorComponent, FiltersComponent ],
  templateUrl: './set-to-screen.component.html',
  styleUrl: './set-to-screen.component.scss'
})
export class SetToScreenComponent {

  @Input() dialog = signal<boolean>(false);
  @Input() content = signal<Playlist | Schedule | any>(null);

  @Output() onScreenChange = new EventEmitter<any>();

  confirmation = inject(ConfirmationService);
  screenService = inject(ScreenService);
  message = inject(MessageService);
  utils = inject(UtilityService);

  screens = signal<Screen[]>([]);
  screenItems = signal<ScreenItems[]>([]);
  selectedScreens = signal<Screen[]>([]);
  pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  isLoading = signal<boolean>(false);
  isSending = signal<boolean>(false);

  onInitializedScreens(page: number = 1, limit: number = 10) {
    this.isLoading.set(true);
    this.screenService.onLoadScreens(page, limit).subscribe({
      next: (res: any) => {
        this.screens.set(res.items);
        this.pagination.set(res.meta);
      },
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.isLoading.set(false)
    })
  }

  onPageChange(event: any) {
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.pagination();
    this.pagination.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.onInitializedScreens(pageNumber, event.rows);
  }

  onCloseContents() {
    this.onScreenChange.emit(this.selectedScreens());
    this.selectedScreens.set([]);
  }
  
  isDisconnected(screen: Screen | any): boolean {
    return ['disconnected'].includes(screen.status) || !screen.status;
  }
  
  onCheckAllDone(screenItems: ScreenItems[]) {
    const finished = screenItems.every(i => i.status === 'success' || i.status === 'error' || i.status === 'cancel');
    if (finished) {
      this.isSending.set(false);
      this.onScreenChange.emit(true);
      this.message.add({ severity: 'success', summary: 'Success', detail: 'Content applied successfully!' });
    }
  }

  onClickApply(event: any) {
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
        this.isSending.set(true);
        const screens = this.selectedScreens().filter(screen => ['connected'].includes(screen.status) && screen.status);
        
        const newScreens: any = Array.from(screens).map((screen: any) => ({ id: screen.id, content: this.content(), progress: 0, status: 'pending' }));
        this.screenItems.set(newScreens);

        this.screenItems().forEach((item: ScreenItems) => {
          item.status = 'sending';
          item.sub = this.screenService.onApplyContents(item.id, item.content).subscribe({
            next: (event: any) => {
              if (event.type == HttpEventType.UploadProgress && event.total) {
                item.progress = Math.round((event.loaded / event.total) * 100);
              }

              if (event.type == HttpEventType.Response) {
                item.status = 'success';
                item.progress = 100;
              }
            },
            error: (error: any) => {
              item.status = 'error';
              item.progress = 0;
              item.error = error;
              console.error(`Upload failed: ${item.content.name}`, error);
              this.onCheckAllDone(newScreens)
            },
            complete: () => this.onCheckAllDone(newScreens)
          })
        })
      },
    })
  }
}
