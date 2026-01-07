import { Component, inject, ViewChild } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { ScreenService } from '../../screens/screen.service';
import { UtilityService } from '../../../core/services/utility.service';
import { BroadcastService } from '../../settings/broadcast/broadcast.service';
import { Screen } from '../../screens/screen';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ContentSelectionComponent } from '../../../shared/components/content-selection/content-selection.component';

@Component({
  selector: 'app-screen-controls',
  imports: [ PrimengUiModule, ContentSelectionComponent ],
  templateUrl: './screen-controls.component.html',
  styleUrl: './screen-controls.component.scss'
})
export class ScreenControlsComponent {

  @ViewChild('contents') contents!: ContentSelectionComponent;

  screenService = inject(ScreenService);
  broadcastService = inject(BroadcastService);
  utils = inject(UtilityService);

  confirmation = inject(ConfirmationService);
  message = inject(MessageService);

  onClickOpenContents() {
    const selectedScreens: Screen[] = this.selectMultipleScreens();
    if (selectedScreens.length == 0) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'Please select at least one screen.' });
      return;
    }
    this.contents.selectionContent.set([]);
    this.showContents.set(true);
  }

  onClickApplyContents() {
    this.message.add({ severity:'success', summary: 'Success', detail: 'Contents applied successfully!' });
    this.selectionContent.set(null);
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
      this.selectionContent.set(null);
      return;
    }
    this.selectedContentForm.patchValue({ 
      id: event.id, 
      name: event.name,
      type: this.contentType()
    });
  }

  onContentTypeChange(event: any) {
    this.contentType.set(event);
  }

  get isMobile() { return this.utils.isMobile(); }
  get isTablet() { return this.utils.isTablet(); }
  get contentType() { return this.screenService.contentType; }
  get showBroadcast() { return this.screenService.showBroadcast; }
  get showSettings() { return this.screenService.showSettings; }
  get showContents() { return this.screenService.showContents; }
  get toggleControls() { return this.screenService.toggleControls; }
  get selectionContent() { return this.screenService.selectionContent; }
  get selectMultipleScreens() { return this.screenService.selectMultipleScreens; }

  get selectedContentForm() { return this.screenService.selectedContentForm; }
}
