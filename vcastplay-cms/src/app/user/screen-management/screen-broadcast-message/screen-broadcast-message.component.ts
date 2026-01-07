import { Component, EventEmitter, inject, Output } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { UtilityService } from '../../../core/services/utility.service';
import { BroadcastService } from '../../settings/broadcast/broadcast.service';

@Component({
  selector: 'app-screen-broadcast-message',
  imports: [ PrimengUiModule ],
  templateUrl: './screen-broadcast-message.component.html',
  styleUrl: './screen-broadcast-message.component.scss'
})
export class ScreenBroadcastMessageComponent {

  @Output() messages = new EventEmitter<any>();

  broadcastService = inject(BroadcastService);
  utils = inject(UtilityService);

  ngOnInit() { 
    this.broadcastService.onGetMessages();
  }

  onSelectionChange(event: any) { 
    this.messages.emit(event); 
  }

  get message() { return this.broadcastService.messages; }
  get selectedArrScreenBroadcastMessage() { return this.broadcastService.selectedArrScreenBroadcastMessage; }
}
