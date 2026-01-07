import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { PlaylistService } from '../../playlist/playlist.service';
import { Playlist } from '../../playlist/playlist';
import { FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-asset-to-playlist',
  imports: [ PrimengUiModule],
  templateUrl: './asset-to-playlist.component.html',
  styleUrl: './asset-to-playlist.component.scss'
})
export class AssetToPlaylistComponent {

  @Input() isShowAddToPlaylist = signal<boolean>(false);
  @Input() assetForm!: FormGroup;

  @Output() selectedPlaylistsChange = new EventEmitter<Playlist[]>();

  playlistService = inject(PlaylistService);
  message = inject(MessageService);

  onClickSaveToPlaylist(event: Event) {    
    this.playlistService.onSaveAssetToPlaylist(this.assetForm.value, this.selectedArrPlaylist());
    this.message.add({ severity:'success', summary: 'Success', detail: 'Asset added to playlist successfully!' });
    this.isShowAddToPlaylist.set(false);
    this.selectedArrPlaylist.set([]);
    this.assetForm.reset();
  }
  
  onClickCancelSaveToPlaylist() {
    this.isShowAddToPlaylist.set(false);
    this.selectedArrPlaylist.set([]);
  }

  onSelectionChange(event: any) {
    this.selectedPlaylistsChange.emit(event);
  }

  get playlists() { return this.playlistService.playlists; }
  get selectedArrPlaylist() { return this.playlistService.selectedArrPlaylist; }

}
