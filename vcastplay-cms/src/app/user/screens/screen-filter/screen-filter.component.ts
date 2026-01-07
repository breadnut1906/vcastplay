import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenService } from '../screen.service';
import { TagService } from '../../settings/tags/tag.service';
import { UtilityService } from '../../../core/services/utility.service';
import { GroupService } from '../../settings/groups/group.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-screen-filter',
  imports: [ PrimengUiModule ],
  templateUrl: './screen-filter.component.html',
  styleUrl: './screen-filter.component.scss'
})
export class ScreenFilterComponent {
  
  @Input() showOrientation: boolean = false;
  @Input() showLocation: boolean = false;
  @Input() showScreenStatus: boolean = false;

  @Output() filterChange = new EventEmitter<any>();

  storage = inject(StorageService);
  screenService = inject(ScreenService);
  tagService = inject(TagService);
  groupService = inject(GroupService);
  utils = inject(UtilityService);

  useFilter = signal<boolean>(false);

  ngOnInit() {
    this.onLoadGroups()
  }

  onLoadGroups() {
    this.groupService.onLoadGroups(1, 10)
  }

  onLoadSubGroupsById(id: number) {
    this.subGroups.set([]);
    if (!id) return
    this.groupService.onLoadSubGroupsById(id, 1, 10)
  }

  onClickApply(filter: any) {
    const filters = this.screenFilterForm.value;
    this.filterChange.emit({ filters });
    this.useFilter.set(true);
    filter.hide();
  }

  onClickClear(filter: any) {
    this.screenFilterForm.reset();
    this.filterChange.emit({ filters: this.screenFilterForm.value });
    this.useFilter.set(false);
    filter.hide();
  }

  get status() { return this.utils.status; }
  get orientations() { return this.utils.orientations; }
  
  get types() { return this.screenService.types; }
  get screenStatus() { return this.screenService.screenStatus; }
  get contentStatus() { return this.screenService.contentStatus; }
  get screenFilterForm() { return this.screenService.screenFilterForm; }

  get groups() { return this.groupService.groups };
  get subGroups() { return this.groupService.subGroups };
}
