import { Component, inject } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenService } from '../../screens/screen.service';
import { UtilityService } from '../../../core/services/utility.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-screen-settings',
  imports: [ PrimengUiModule ],
  templateUrl: './screen-settings.component.html',
  styleUrl: './screen-settings.component.scss'
})
export class ScreenSettingsComponent {

  screenService = inject(ScreenService);
  utils = inject(UtilityService);

  confirmation = inject(ConfirmationService);
  message = inject(MessageService);

  get toggleOptions() { return this.screenService.toggleOptions; }
  get screenConfigForm() { return this.screenService.screenConfigForm; }
}
