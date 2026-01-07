import { Component, inject, Input, signal } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { PlaylistService } from '../playlist.service';
import { UtilityService } from '../../../core/services/utility.service';
import { Playlist } from '../playlist';
import { Assets } from '../../assets/assets';
import { DesignLayout } from '../../design-layout/design-layout';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-playlist-item-content',
  imports: [ PrimengUiModule ],
  templateUrl: './playlist-item-content.component.html',
  styleUrl: './playlist-item-content.component.scss'
})
export class PlaylistItemContentComponent {
  
  @Input() playlist!: FormGroup;
  @Input() content: Assets | DesignLayout | any;
  @Input() isPlaying: boolean = false;

  showConfig = signal<boolean>(false);

  utils = inject(UtilityService);
  playlistService = inject(PlaylistService);

  onCurrentPlaying() {
    const { contentId } = this.content;
    return this.currentPlaying?.contentId == contentId;
  }

  onClickRemove(content: Assets | DesignLayout) {
    const { contentId } = content;
    const { contents, files }: any = this.playlist.value;

    const newContents = contents.filter((item: any) => item.contentId !== contentId);
    const newFiles = files.filter((item: any) => item.contentId !== contentId);
    this.playlist.patchValue({ contents: newContents, files: newFiles });
  }

  onClickHide() {
    this.showConfig.set(!this.showConfig());
  }

  get currentPlaying() { return this.playlistService.currentPlaying(); }
}
