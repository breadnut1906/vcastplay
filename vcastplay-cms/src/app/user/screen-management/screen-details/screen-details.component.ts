import { Component, inject, Input } from '@angular/core';
import { Screen } from '../../screens/screen';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { UtilityService } from '../../../core/services/utility.service';

@Component({
  selector: 'app-screen-details',
  imports: [ PrimengUiModule ],
  templateUrl: './screen-details.component.html',
  styleUrl: './screen-details.component.scss'
})
export class ScreenDetailsComponent {

  @Input() screen!: Screen | any;

  utils = inject(UtilityService);
}
