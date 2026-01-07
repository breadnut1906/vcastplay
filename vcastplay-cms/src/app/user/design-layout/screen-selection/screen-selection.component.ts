import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenService } from '../../screens/screen.service';
import { UtilityService } from '../../../core/services/utility.service';
import { Screen } from '../../screens/screen';
import _ from 'lodash';
import { ScreenFilterComponent } from '../../screens/screen-filter/screen-filter.component';

@Component({
  selector: 'app-screen-selection',
  imports: [ PrimengUiModule, ScreenFilterComponent ],
  templateUrl: './screen-selection.component.html',
  styleUrl: './screen-selection.component.scss'
})
export class ScreenSelectionComponent {
  
  @Output() screenChange = new EventEmitter<any>();

  screenService = inject(ScreenService);
  utils = inject(UtilityService);

  selectedScreen = signal<Screen | null>(null);

  screenFilters = signal<any>(this.screenFilterForm.valueChanges)
  filteredScreen = computed(() => {
    const { type, group, subGroup, orientation, status, keywords } = this.screenFilters();
    const screens = this.screenService.screens();

    return screens.filter((screen: any) => {
      const matchesType = !type || screen.type.includes(type);
      const matchesGroup = !group || screen.group?.includes(group);
      const matchesSubGroup = !subGroup || screen.subGroup?.includes(subGroup);
      const matchesOrientation = !orientation || screen.displaySettings.orientation?.includes(orientation);
      const matchesStatus = !status || (screen.status == status);
      const matchesKeywords = !keywords || _.includes(screen.name.toLowerCase(), keywords.toLowerCase()) || _.includes(screen.code, keywords);

      return matchesType && matchesGroup && matchesSubGroup && matchesOrientation && matchesStatus && matchesKeywords;
    })
  });

  ngOnInit() {
    this.screenService.onGetScreens();
  }

  onFilterChange(event: any) {
    this.screenFilters.set(event.filters);
  }

  onSelectionChange(event: any) {
    this.selectedScreen.set(event);
    this.screenChange.emit(event);
  }

  onGetPreviewStyle(screen: Screen) {
    const maxSize = 100; // preview area size
    const resolution: any = screen.resolution.split('x');
    const ratio = resolution[0] / resolution[1];

    let previewWidth: number;
    let previewHeight: number;

    if (ratio > 1) {
      // Landscape
      previewWidth = maxSize;
      previewHeight = maxSize / ratio;
    } else {
      // Portrait or square
      previewHeight = maxSize;
      previewWidth = maxSize * ratio;
    }

    return {
      width: `${previewWidth}px`,
      height: `${previewHeight}px`
    };
  }
  
  get screenFilterForm() { return this.screenService.screenFilterForm; }
}
