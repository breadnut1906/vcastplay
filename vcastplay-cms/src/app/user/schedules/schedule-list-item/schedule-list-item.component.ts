import { Component, inject, Input, TemplateRef } from '@angular/core';
import { UtilityService } from '../../../core/services/utility.service';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { Schedule } from '../schedules';

@Component({
  selector: 'app-schedule-list-item',
  imports: [ PrimengUiModule ],
  templateUrl: './schedule-list-item.component.html',
  styleUrl: './schedule-list-item.component.scss'
})
export class ScheduleListItemComponent {

  @Input() schedule!: Schedule;
  @Input() actionBtn!: TemplateRef<any>;

  utils = inject(UtilityService)
}
