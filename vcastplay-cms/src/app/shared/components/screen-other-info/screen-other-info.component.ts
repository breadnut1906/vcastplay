import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { Screen } from '../../../user/screens/screen';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { UtilityService } from '../../../core/services/utility.service';
import moment from 'moment';
import { MapmarkersComponent } from '../mapmarkers/mapmarkers.component';

@Component({
  selector: 'app-screen-other-info',
  imports: [ PrimengUiModule, MapmarkersComponent ],
  templateUrl: './screen-other-info.component.html',
  styleUrl: './screen-other-info.component.scss'
})
export class ScreenOtherInfoComponent {

  @Input() screen!: Screen | any;
  @Input() isShowInfo = signal<boolean>(false);
  @Input() isAdmin: boolean = false;

  @Output() isShowInfoChange = new EventEmitter<boolean>();

  utils = inject(UtilityService);

  hourFormat = (date: any) => {
    const start = moment(date.start).format('hh:mm A');
    const end = moment(date.end).format('hh:mm A');
    return `${start} - ${end}`;
  }
}
