import { Component, inject } from '@angular/core';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-broadcast-preview',
  imports: [],
  templateUrl: './broadcast-preview.component.html',
  styleUrl: './broadcast-preview.component.scss'
})
export class BroadcastPreviewComponent {

  player = inject(PlayerService)
  
  get broadcast() { return this.player.playerBroadcast(); }

}
