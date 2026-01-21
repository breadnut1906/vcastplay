import { Component, inject, Input, signal, ViewChild } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenService } from '../../screens/screen.service';
import { UtilityService } from '../../../core/services/utility.service';
import { BroadcastService } from '../../settings/broadcast/broadcast.service';
import { Screen } from '../../screens/screen';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ContentSelectionComponent } from '../../../shared/components/content-selection/content-selection.component';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-screen-controls',
  imports: [ PrimengUiModule, ContentSelectionComponent ],
  templateUrl: './screen-controls.component.html',
  styleUrl: './screen-controls.component.scss'
})
export class ScreenControlsComponent {

  @ViewChild('contents') contents!: ContentSelectionComponent;

  @Input() selectMultipleScreens = signal<Screen[]>([]);

  screenService = inject(ScreenService);
  broadcastService = inject(BroadcastService);
  utils = inject(UtilityService);

  confirmation = inject(ConfirmationService);
  message = inject(MessageService);

  showSettings = signal<boolean>(false);
  showContents = signal<boolean>(false);
  showBroadcast = signal<boolean>(false);
  formBuilder = inject(FormBuilder);
  selectedContentForm = this.formBuilder.group({
    id: [''],
    name: ['', [ Validators.required ]],
    type: ['']
  })

  onClickOpenContents() {
    const selectedScreens: Screen[] = this.selectMultipleScreens();
    if (selectedScreens.length == 0) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one screen.' });
      return;
    }
    // this.contents.selectionContent.set([]);
    this.showContents.set(true);
  }

  onClickApplyContents() {
    this.message.add({ severity:'success', summary: 'Success', detail: 'Contents applied successfully!' });
    console.log(this.selectedContentForm.value);
    this.selectedContentForm.reset();
  }

  onClickOpenScreen() {
    const selectedScreens: Screen[] = this.selectMultipleScreens();
    if (selectedScreens.length == 0) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one screen.' });
      return;
    }
    this.screenService.onClickOpenScreen();
  }

  onClickCloseScreen() {
    const selectedScreens: Screen[] = this.selectMultipleScreens();
    if (selectedScreens.length == 0) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one screen.' });
      return;
    }
    this.screenService.onCloseScreen();
  }

  onClickRestartScreen() {
    const selectedScreens: Screen[] = this.selectMultipleScreens();
    if (selectedScreens.length == 0) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one screen.' });
      return;
    }
    this.screenService.onRestartScreen();
  }

  onClickShutdownScreen() {
    const selectedScreens: Screen[] = this.selectMultipleScreens();
    if (selectedScreens.length == 0) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one screen.' });
      return;
    }
    this.screenService.onShutdownScreen();
  }

  onClickBroadCastMessage() {
    const selectedScreens: Screen[] = this.selectMultipleScreens();
    if (selectedScreens.length == 0) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one screen.' });
      return;
    }
    this.showBroadcast.set(true);
  }

  onClickOpenSettings() {
    const selectedScreens: Screen[] = this.selectMultipleScreens();
    if (selectedScreens.length == 0) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one screen.' });
      return;
    }
    this.showSettings.set(true);
  }

  onClickCloseDialog() {
    this.showContents.set(false);
  }
  
  onSelectionChange(event: any) {
    if (!event) {
      this.selectedContentForm.reset();
      return;
    }
    this.selectedContentForm.patchValue({  id: event.id,  name: event.name, type: event.type });
  }

  onContentTypeChange(event: any) {
    this.contentType.set(event);
  }

  get isMobile() { return this.utils.isMobile(); }
  get isTablet() { return this.utils.isTablet(); }
  get contentType() { return this.screenService.contentType; }
}
