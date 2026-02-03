import { Component, inject, Input, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { PlaylistService } from '../playlist.service';
import { UtilityService } from '../../../core/services/utility.service';
import { Playlist } from '../playlist';
import { Assets } from '../../assets/assets';
import { DesignLayout } from '../../design-layout/design-layout';
import { FormGroup } from '@angular/forms';
import { environment } from '../../../../environments/environment.development';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-playlist-item-content',
  imports: [ PrimengUiModule ],
  templateUrl: './playlist-item-content.component.html',
  styleUrl: './playlist-item-content.component.scss'
})
export class PlaylistItemContentComponent {
  
  @Input() playlist!: FormGroup;
  @Input() content: any;
  @Input() isPlaying: boolean = false;

  showConfig = signal<boolean>(false);

  publicURL = environment.public;
  playlistService = inject(PlaylistService);
  storage = inject(StorageService);
  utils = inject(UtilityService);

  onCurrentPlaying() {
    const { sequence } = this.content;
    return this.currentPlaying?.sequence == sequence;
  }

  onClickRemove(content: Assets | DesignLayout) {
    const { sequence } = content;
    const { entries }: any = this.playlist.value;

    const newEntries = entries.filter((item: any) => item.sequence !== sequence);
    this.playlist.patchValue({ entries: newEntries });
  }

  onClickHide() {
    this.showConfig.set(!this.showConfig());
  }

  get tenantId() { return this.storage.get('id'); }
  get currentPlaying() { return this.playlistService.currentPlaying(); }
}
