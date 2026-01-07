import { Component, computed, EventEmitter, inject, Input, Output, signal, ViewChild } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { SchedulesService } from '../schedules.service';
import { UtilityService } from '../../../core/services/utility.service';
import { AssetsService } from '../../assets/assets.service';
import { PlaylistService } from '../../playlist/playlist.service';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { MessageService } from 'primeng/api';
import { FormGroup } from '@angular/forms';
import { ComponentsModule } from "../../../core/modules/components/components.module";
import { ContentSelectionComponent } from '../../../shared/components/content-selection/content-selection.component';

@Component({
  selector: 'app-schedules-content-list',
  imports: [PrimengUiModule, ComponentsModule ],
  templateUrl: './schedules-content-list.component.html',
  styleUrl: './schedules-content-list.component.scss'
})
export class SchedulesContentListComponent {

  @ViewChild('contents') contents!: ContentSelectionComponent;

  @Input() calendar!: FullCalendarComponent 
  @Input() scheduleForm!: FormGroup;
  @Input() showAddContents = signal<boolean>(false);

  @Output() contentsByType = new EventEmitter<any>();

  assetService = inject(AssetsService);
  playlistService = inject(PlaylistService);
  scheduleService = inject(SchedulesService);
  utils = inject(UtilityService);
  message = inject(MessageService);
  
  showContentSelection = signal<boolean>(false);
  dateRange!: { start: Date; end: Date };

  filteredColor = computed(() => {
    return this.colors.filter((color: any) => color.text != 'white');
  })

  constructor() { }

  ngOnInit() {
    this.timeValues.set(this.utils.generateTimeOptions());
  }

  async onClickSaveContent(event: Event) { 
    const { hours, weekdays, allDay } = this.contentItemForm.value;
    if (this.contentItemForm.invalid) {
      this.contentItemForm.markAllAsTouched();
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Please input required fields (*)' });
      return;
    }

    if (!allDay) {
      if (hours.length == 0) {
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Please add at least one hour' });
        return;
      }

      if (weekdays.length == 0) {
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Please select at least one day' });
        return;
      }
    }

    this.scheduleService.onSaveContent(this.contentItemForm.value, this.calendar).then(async (result: any) => { 
      const { contents } = this.scheduleForm.value;
      const newContents = { contents: [...contents, ...result] }
      this.scheduleForm.patchValue(newContents);
      const [ totalContentByType ] = await Promise.all([this.scheduleService.onGetTotalContentsByType(newContents.contents)]);
      this.contentsByType.emit(totalContentByType);      
      this.showAddContents.set(false);
    });
  }

  onSelectionChange(event: any) {
    this.contentItemForm.patchValue({ content: event, allWeekdays: (this.weekdays.length + 1) > 7 });
    this.showContentSelection.set(false);
  }

  onUpdateContentEventColor(color: any) {
    this.contentItemForm.patchValue({ color: color.hex });  
  }

  formcontrol(fieldName: string) {
    return this.utils.getFormControl(this.contentItemForm, fieldName);
  }

  get colors() { return this.utils.colors; }
  get timeValues() { return this.scheduleService.timeValues; }
  get contentItemForm() { return this.scheduleService.contentItemForm; }
  get contentTypes() { return this.scheduleService.contentTypes; }
  get contentSignal() { return this.scheduleService.contentSignal; }
  get selectedContent() { return this.scheduleService.selectedContent; }
  get selectedColor() { return this.contentItemForm.get('color'); }
  
  get isSpecificTime() { return this.contentItemForm.get('isSpecificTime'); }
  get calendarViewSignal() { return this.scheduleService.calendarViewSignal; }
  get start() { return this.contentItemForm.get('start'); }
  get end() { return this.contentItemForm.get('end'); }
  get calendarDateRange() { return this.scheduleService.calendarDateRange; }
  get calendarSelectedDate() { return this.scheduleService.calendarSelectedDate; }

  get content() { return this.contentItemForm.get('content')?.value; }
  get weekdays() { return this.contentItemForm.get('weekdays')?.value; }
}
