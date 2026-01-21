import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { UtilityService } from '../../../core/services/utility.service';
import { BroadcastService } from '../../settings/broadcast/broadcast.service';
import { ScreenMessage } from '../../screens/screen';

@Component({
  selector: 'app-screen-broadcast-message',
  imports: [ PrimengUiModule ],
  templateUrl: './screen-broadcast-message.component.html',
  styleUrl: './screen-broadcast-message.component.scss'
})
export class ScreenBroadcastMessageComponent {

  @Input() showBroadcast = signal<boolean>(false);
  @Output() onBroadCastMessage = new EventEmitter<any>();

  broadcastService = inject(BroadcastService);
  utils = inject(UtilityService);

  messages = signal<ScreenMessage[]>([]);
  selectedScreenBroadcastMessage = signal<ScreenMessage | null>(null);

  ngOnInit() { }

  onLoadMessages() { 
    this.messages.set(this.broadcastService.onGetMessages()); 
  }

  onClickSendBroadcast() { 
    this.onBroadCastMessage.emit(this.selectedScreenBroadcastMessage()); 
  }

  onClickCloseDialog() { 
    this.showBroadcast.set(false);
  }
}
