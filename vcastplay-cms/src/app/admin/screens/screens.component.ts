import { Component, inject, signal } from '@angular/core';
import { ScreensService } from './screens.service';
import { PrimengUiModule } from '../../core/modules/primeng-ui/primeng-ui.module';
import { ComponentsModule } from '../../core/modules/components/components.module';
import { UtilityService } from '../../core/services/utility.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Screen } from '../../user/screens/screen';
import { Pagination } from '../../shared/interfaces/general';

@Component({
  selector: 'app-screens',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './screens.component.html',
  styleUrl: './screens.component.scss'
})
export class ScreensComponent {
  
  pageInfo: MenuItem = [ {label: 'Screens'}, {label: 'List'} ];

  screenService = inject(ScreensService);
  utils = inject(UtilityService);
  confirmation = inject(ConfirmationService);
  message = inject(MessageService);

  screens: Screen[] = [];
  selectedScreen = signal<Screen | null>(null);
  isLoading = signal<boolean>(false);
  isShowInfo = signal<boolean>(false);

  pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });

  ngOnInit() {
    this.onLoadScreens();
  }

  onLoadScreens(page: number = 1, limit: number = 10) {
    this.isLoading.set(true);
    this.screenService.onGetScreens(page, limit).subscribe({
      next: (res: any) => {
        const { items, meta } = res;
        this.screens = items;
        this.pagination.set(meta);        
      },
      error: (err) => {},
      complete: () => this.isLoading.set(false)
    });
  }

  onFilterChange(event: any) {
    
  }
  
  onPageChange(event: any) {
    const rows = event.rows;
    const pageNumber = event.first / event.rows + 1;
    const { currentPage, itemsPerPage, ...meta } = this.pagination();
    this.pagination.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
    this.onLoadScreens(pageNumber, event.rows);
  }

  onClickView(item: Screen) {
    this.selectedScreen.set(item);
    this.isShowInfo.set(true);
  }

  onClickDelete(item: Screen, event: Event) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this screen?',
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
        this.screenService.onDeleteScreen(item.id).subscribe({
          next: (res: any) => {
            this.message.add({ severity:'success', summary: 'Success', detail: 'Screen deleted successfully!' });
          },
          error: (err: any) => {
            this.message.add({ severity:'error', summary: 'Error', detail: err.error.message || 'Failed to delete screen!' });
          },
          complete: () => this.onLoadScreens()
        });
      },
      reject: () => { }
    })
  }
}
