import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenService } from '../../../user/screens/screen.service';
import { UtilityService } from '../../../core/services/utility.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-screen-settings',
  imports: [ PrimengUiModule ],
  templateUrl: './screen-settings.component.html',
  styleUrl: './screen-settings.component.scss'
})
export class ScreenSettingsComponent {

  @Input() screen!: Screen | any;
  @Input() showSettings = signal<boolean>(false);
  @Output() onSettingsChange = new EventEmitter<any>();

  screenService = inject(ScreenService);
  utils = inject(UtilityService);

  confirmation = inject(ConfirmationService);
  message = inject(MessageService);

  onClickAppy() {
    this.onSettingsChange.emit(this.settingsForm.value);
    this.showSettings.set(false)
    this.settingsForm.reset();
  }

  get settingsForm() { return this.screenService.settingsForm; }
  get displays() { 
    return this.screen.info?.graphics.displays; 
  }
  get fullscreenMode() { 
    return this.settingsForm.get('fullscreen')?.value;
  }
}
