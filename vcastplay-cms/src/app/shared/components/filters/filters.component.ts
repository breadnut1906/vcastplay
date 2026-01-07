import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Popover } from 'primeng/popover';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { UtilityService } from '../../../core/services/utility.service';

@Component({
  selector: 'app-filters',
  imports: [ PrimengUiModule ],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent {

  @ViewChild('filter') filterTemplate!: Popover;
  
  @Input() showOthers: boolean = true;
  @Output() filterChange = new EventEmitter<any>();

  utils = inject(UtilityService);

  filters: FormGroup = new FormGroup({
    keywords: new FormControl(null),
    status: new FormControl(null),
    sortBy: new FormControl(null),
    sort: new FormControl('asc', { nonNullable: true })
  })

  status: any[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Suspended', value: 'suspended' }
  ]

  sortBy: any[] = [
    { label: 'Name', value: 'name' },
    { label: 'Description', value: 'description' },
    { label: 'Created At', value: 'createdAt' }
  ]

  constructor() {
    this.keywords?.valueChanges.subscribe(value => {
      this.utils.filterValues.set({ keywords: value });
    })
  }

  onClickApply() {
    const filters = this.filters.value;
    this.filterValues.set(this.filters.value);
    this.filterChange.emit({ filters });
    if(this.showOthers) this.filterTemplate.hide();
  }

  onClickClear() {
    this.filters.reset();
    this.filterValues.set({});
    
    const filters = this.filters.value;
    this.filterChange.emit({ filters });
    if(this.showOthers) this.filterTemplate.hide();
  }

  get keywords() {  return this.filters.get('keywords'); }
  get filterValues() { return this.utils.filterValues; }
}
