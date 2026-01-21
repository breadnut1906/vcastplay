import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenService } from '../../screens/screen.service';
import { UtilityService } from '../../../core/services/utility.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-screen-settings',
  imports: [ PrimengUiModule ],
  templateUrl: './screen-settings.component.html',
  styleUrl: './screen-settings.component.scss'
})
export class ScreenSettingsComponent {

  @Input() showSettings = signal<boolean>(false);
  @Output() onSettingsChange = new EventEmitter<any>();

  screenService = inject(ScreenService);
  utils = inject(UtilityService);

  confirmation = inject(ConfirmationService);
  message = inject(MessageService);

  formBuilder = inject(FormBuilder);
  screenConfigForm = this.formBuilder.group({
    display: [false],
    audio: [false],
    alwaysTop: [false],
    fullscreen: [false],
    syncTime: [false],
    playbackLogging: [false],
  })
  // screenConfigForm: FormGroup = new FormGroup({
  //   display: new FormControl(false),
  //   audio: new FormControl(false),
  //   alwaysTop: new FormControl(false),
  //   fullscreen: new FormControl(false),
  //   syncTime: new FormControl(false),
  //   playbackLogging: new FormControl(false),
  // })

  onClickAppy() {
    this.onSettingsChange.emit(this.screenConfigForm.value);
  }
}
