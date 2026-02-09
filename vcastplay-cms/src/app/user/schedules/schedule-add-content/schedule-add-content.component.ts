import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { ContentSelectionComponent } from '../../../shared/components/content-selection/content-selection.component';
import { WeekdayHourSelectionComponent } from '../../../shared/components/weekday-hour-selection/weekday-hour-selection.component';
import { UtilityService } from '../../../core/services/utility.service';
import moment from 'moment';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-schedule-add-content',
  imports: [ PrimengUiModule, ContentSelectionComponent, WeekdayHourSelectionComponent ],
  templateUrl: './schedule-add-content.component.html',
  styleUrl: './schedule-add-content.component.scss'
})
export class ScheduleAddContentComponent {

  @Input() dialog = signal<boolean>(false);
  @Output() onAddContentChange = new EventEmitter<any>();

  message = inject(MessageService);
  utils = inject(UtilityService);

  formBuilder = inject(FormBuilder);
  contentForm = this.formBuilder.group({
    start: [moment(new Date()).startOf('week').toDate(), Validators.required],
    end: [moment(new Date()).endOf('week').toDate(), Validators.required],
    type: [null],
    content: this.formBuilder.group({
      id: [null],
      name: [null],
      type: [null],
    }, Validators.required),
    isAllDay: [false],
    isAllWeekdays: [false],
    weekdays: [[], Validators.required],
    hours: [[], Validators.required],
    color: [null, Validators.required],
  }, { validators: [ this.onDateRangeValidator] });
  showContents = signal<boolean>(false);
  
  constructor() {  }

  onDialogShow() {
    this.contentForm.patchValue({
      start: moment(new Date()).startOf('week').toDate(),
      end: moment(new Date()).endOf('week').toDate()
    })
  }
  
  onDateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('start')?.value;
    const end = group.get('end')?.value;

    if (start && end && new Date(start) > new Date(end)) {
      return { startAfterEnd: true }
    }
    return null;
  }
  
  filteredColor = computed(() => {
    return this.colors.filter((color: any) => color.text != 'white');
  })

  onAddContent() {
    if (this.contentForm.invalid) {
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields' });
      this.contentForm.markAllAsTouched();
      return;
    }
    this.onAddContentChange.emit(this.contentForm.value);
    this.onCloseDialog();
  }

  onCloseDialog() {
    this.dialog.set(false);
    this.contentForm.reset();
  }

  onSelectionChange(event: any) {
    const { type, content } = event;    
    this.contentForm.patchValue({ type, content });
    
  }
  
  formcontrol(fieldName: string) {
    return this.utils.getFormControl(this.contentForm, fieldName);
  }
  
  get colors() { return this.utils.colors; }
}
