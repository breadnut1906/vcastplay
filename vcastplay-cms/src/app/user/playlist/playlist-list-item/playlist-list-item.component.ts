import { Component, inject, Input, signal, TemplateRef } from '@angular/core';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { Playlist } from '../playlist';
import { UtilityService } from '../../../core/services/utility.service';
import { PlaylistService } from '../playlist.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-playlist-list-item',
  imports: [ PrimengUiModule ],
  templateUrl: './playlist-list-item.component.html',
  styleUrl: './playlist-list-item.component.scss'
})
export class PlaylistListItemComponent {

  @Input() playlist!: Playlist | any;
  @Input() actionBtn!: TemplateRef<any>;

  playlistService = inject(PlaylistService);
  message = inject(MessageService);
  utils = inject(UtilityService);
  isLoading = signal<boolean>(false);
  isDrawerOpen = signal<boolean>(false);
  entries: any[] = [];

  onGetEntriesByPlaylistId(id: number) {
    this.isLoading.set(true);
    this.playlistService.onGetEntriesByPlaylistId(id).subscribe({
      next: (res: any) => this.entries = res[0].entries,
      error: (error: any) => this.message.add({ severity: 'error', summary: 'Error', detail: error.error.message }),
      complete: () => this.isLoading.set(false)
    });
  }

  totalDuration() {
    return this.entries.reduce((acc: any, item: any) => acc + item.duration, 0);
  }

  fileCount() {
    const image = this.entries.filter((item: any) => item.asset.type == 'image').length;
    const video = this.entries.filter((item: any) => item.asset.type == 'video').length;
    const audio = this.entries.filter((item: any) => item.asset.type == 'audio').length;
    const html = this.entries.filter((item: any) => item.asset.type == 'html').length;
    const link = this.entries.filter((item: any) => item.asset.type == 'link').length;
    const facebook = this.entries.filter((item: any) => item.asset.link?.includes('facebook.com') || item.asset.link?.includes('fb.watch')).length;
    const youtube = this.entries.filter((item: any) => item.asset.link?.includes('youtube.com') || item.asset.link?.includes('youtu.be')).length;
    return { image, video, audio, html, link, facebook, youtube };
    
  }
}
