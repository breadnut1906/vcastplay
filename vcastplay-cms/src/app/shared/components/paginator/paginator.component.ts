import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { Pagination } from '../../interfaces/general';
import { UtilityService } from '../../../core/services/utility.service';

@Component({
  selector: 'app-paginator',
  imports: [ PrimengUiModule ],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss'
})
export class PaginatorComponent {

  @Input() pagination = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 })

  @Output() onPageChange = new EventEmitter<any>();

  utils = inject(UtilityService)

}
