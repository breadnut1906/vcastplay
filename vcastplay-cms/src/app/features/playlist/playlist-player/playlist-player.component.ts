import { Component, ElementRef, EventEmitter, forwardRef, inject, Input, Output, QueryList, signal, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { Playlist } from '../playlist';
import { Assets } from '../../assets/assets';
import { DesignLayout } from '../../design-layout/design-layout';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { UtilityService } from '../../../core/services/utility.service';
import { SafeurlPipe } from '../../../core/pipes/safeurl.pipe';
import { PlaylistService } from '../playlist.service';
import { FacebookSDKService } from '../../../core/services/facebook-sdk.service';
import { DesignLayoutPreviewComponent } from '../../design-layout/design-layout-preview/design-layout-preview.component';
import { YoutubeSdkService } from '../../../core/services/youtube-sdk.service';

declare const FB: any;
declare const YT: any;

@Component({
  selector: 'app-playlist-player',
  imports: [ PrimengUiModule, SafeurlPipe, forwardRef(() => DesignLayoutPreviewComponent) ],
  templateUrl: './playlist-player.component.html',
  styleUrl: './playlist-player.component.scss',
})
export class PlaylistPlayerComponent {

  @Input() playlist!: Playlist;
  @Input() isAutoPlay: boolean = false;

  @Output() onCurrentItemChange = new EventEmitter<Assets | DesignLayout | any>();
  @Output() isPlayingChange = new EventEmitter<boolean>();

  // @ViewChild('fbPlayer') fbPlayerRef!: ElementRef<HTMLDivElement>;
  // @ViewChild('ytPlayer') ytPlayerRef!: ElementRef<HTMLDivElement>;

  @ViewChildren('ytPlayer') ytPlayersRef!: QueryList<ElementRef<HTMLDivElement>>[];
  @ViewChildren('fbPlayer') fbPlayersRef!: ElementRef<HTMLDivElement>[];

  playlistService = inject(PlaylistService);
  utils = inject(UtilityService);
  fbService = inject(FacebookSDKService);
  ytService = inject(YoutubeSdkService);

  isPlaying = signal<boolean>(false);
  isTransitioning = signal<boolean>(false);
  isFacebookLoading = signal<boolean>(false);
  currentIndex = signal<number>(0);
  currentItem = signal<Assets | DesignLayout | any>(null);
  nextPreloadedItem = signal<Assets | DesignLayout | any>(null);
  animationClasses = signal<string>('');

  private timerId: any;
  private gapId: any;
  private transitionId: any;
  private fbTimerId: any;
  private ytTimerId: any;
  

  ngOnInit() {
    this.onInitPlaylist();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['playlist'].currentValue) this.onStopPlayback();
    if (changes['playlist'] && changes['playlist'].currentValue && this.isAutoPlay) this.onInitPlaylist(true);
  }

  ngOnDestroy() {
    this.onStopPlayback();
  }

  onClickPlayback() {
    if (this.isPlaying()) this.onStopPlayback();
    else this.onStartPlayback();
  }

  async onInitPlaylist(fromChange: boolean = false) {
    const contents: number = this.playlist?.contents.length || 0;
    this.onClearTimeout();
    this.onStopAllMedias();
    this.currentIndex.set(0);
    await this.ytService.onLoadSDK();
    await this.fbService.onLoadSDK();

    if (contents > 0 && this.isAutoPlay) {
      this.currentItem.set(this.playlist.contents[0]);
      if (this.isAutoPlay || (fromChange && this.isPlaying())) {
        this.onStartPlayback();
      }
    }
  }

  onStartPlayback() {
    const contents: number = this.playlist.contents.length;
    if (contents == 0) return;
    this.isPlaying.set(true);
    this.currentItem.set(this.playlist.contents[this.currentIndex()]);

    if (['image', 'web', 'design'].includes(this.currentItem().type)) this.onImageLoaded(this.currentItem());
    if (this.currentItem().type == 'audio') this.onAudioLoad();
    if (this.currentItem().type == 'video') this.onVideoLoad();
    if (this.currentItem().type == 'facebook') this.onFacebookLoad();
    if (this.currentItem().type == 'youtube') this.onYoutubeLoad();
    this.onCurrentItemChange.emit(this.currentItem());
    this.isPlayingChange.emit(true);

    // this.onPreloadNextItem();
  }

  onStopPlayback() {
    this.isPlaying.set(false);
    this.onClearTimeout();
    this.currentIndex.set(0);
    this.currentItem.set(null);
    
    this.onStopAllMedias();

    this.onCurrentItemChange.emit(null);
    this.isPlayingChange.emit(false);
  }

  onNextItem() {
    const { type, hasGap } = this.playlist.transition;
    const typeDuration = type ? 300 : 0;
    const gapDuration = hasGap ? 1500 : 0;
    this.onClearTimeout();
    
    this.currentItem.set(null);
    this.transitionId = setTimeout(() => {

      this.gapId = setTimeout(() => {
        const isLoop: boolean = this.playlist.loop;
        const contents: number = this.playlist.contents.length;

        let nextIndex: number = this.currentIndex() + 1;

        if (nextIndex >= contents) {
          if (isLoop) {
            nextIndex = 0;
          } else { 
            this.onStopPlayback();
            return;
          }
        }

        this.currentIndex.set(nextIndex);
        this.currentItem.set(this.playlist.contents[nextIndex]);
        
        if (['image', 'web', 'design'].includes(this.currentItem().type)) this.onImageLoaded(this.currentItem());
        if (this.currentItem().type == 'audio') this.onAudioLoad();
        if (this.currentItem().type == 'video') this.onVideoLoad();
        if (this.currentItem().type == 'facebook') this.onFacebookLoad();
        if (this.currentItem().type == 'youtube') this.onYoutubeLoad();

        this.onCurrentItemChange.emit(this.currentItem());
        // this.onPreloadNextItem();
        
      }, gapDuration);

    }, typeDuration);    
  }

  onPreloadNextItem() {
    const nextIndex = (this.currentIndex() + 1) % this.playlist.contents.length;
    this.nextPreloadedItem.set(this.playlist.contents[nextIndex]);
  }

  onVideoLoad() {
    const content: Assets | DesignLayout | any = this.currentItem();
    Promise.resolve().then(() => {
      const videos = document.querySelectorAll('video');
      for (const v of videos) {
        if (v.id == content.contentId) {
          v.currentTime = 0;
          v.muted = false;
          v.play()
        }
      };
    })
  }

  // For Image and Web links
  onImageLoaded(item: Assets) {
    const duration = item.duration * 1000 || 5000;    
    this.timerId = setTimeout(() => this.onNextItem(), duration);
  }

  onIFrameLoad(item: Assets) {
    if (item.type == 'web') return item.url;
    else return '';
  }

  onAudioLoad() {
    const content: Assets | DesignLayout | any = this.currentItem();
    Promise.resolve().then(() => {
      const audios = document.querySelectorAll('audio');
      for (const a of audios) {
        if (a.id == content.contentId) {
          a.currentTime = 0;
          a.play();
        }
      }
    })
  }
  
  async onYoutubeLoad() {
    this.ytTimerId = setTimeout(async () => {
      const item = this.currentItem();
      const { videoId } = this.utils.onGetEmbedUrl(item.link);

      this.ytPlayersRef.forEach((player: any) => {
        const playerEl = player.nativeElement;
        if (!playerEl) return;

        if (item.contentId == playerEl.id) {

          if (playerEl._ytInstance && playerEl._ytInstance.destroy) {
            playerEl._ytInstance.destroy();
          }

          const player = new YT.Player(playerEl, {
            videoId,
            playerVars: { autoPlay: 1, controls: 0, playsinline: 1, showinfo: 0 },
            events: {
              onReady: (event: any) => {
                player.playVideo()
                playerEl._ytInstance = player;
              },
              onStateChange: (event: any) => {
                if (event.data == YT.PlayerState.ENDED) {                  
                  player.seekTo(0);
                  player.stopVideo();
                  this.onNextItem();
                }
              },
              onError: (event: any) => {
                console.warn('YouTube player error:', event.data);
                this.onNextItem();
              }
            }
          })
        }
      })
    }, 10);
  }

  async onFacebookLoad() { 
    let fbPlayer: any;
    this.isFacebookLoading.set(true);

    this.fbTimerId = setTimeout(async () => {
      const item = this.currentItem();

      this.fbPlayersRef.forEach(async (player: any) => {

        const playerEl = player.nativeElement;        
        if (!playerEl) return;

        if (item.contentId == playerEl.id) {
          try {
            await FB.Event.unsubscribe('xfbml.ready');
            await FB.Event.subscribe('xfbml.ready', async (msg: any) => {     
              this.isFacebookLoading.set(false);
              if (msg.type === 'video' && msg.instance) {
                fbPlayer = msg.instance;
                fbPlayer.play();
                
                fbPlayer.subscribe('finishedPlaying', () => {
                  fbPlayer.pause();
                  this.onNextItem();
                });

                fbPlayer.subscribe('error', (err: any) => {
                  console.warn('FB Player error:', err);
                  this.onNextItem()
                })
              }
            });
            await FB.Event.subscribe('xfbml.error', (err: any) => {
              console.warn('FB Player error:', err);
              this.onNextItem()
            });
            this.fbService.onFacebookParse(playerEl);

            const iframe = playerEl.querySelector('iframe');
            if (iframe) {
              const orientation = iframe.offsetWidth > iframe.offsetHeight ? 'landscape' : 'portrait';
              const scale = orientation == 'landscape' ? 1 : playerEl.clientHeight / iframe.clientHeight;
              iframe.style.position = 'absolute';
              iframe.style.top = '50%';
              iframe.style.left = '50%';
              iframe.style.transformOrigin = 'center center';
              iframe.style.border = 'none';
              iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;
            }

          } catch (err) {
            console.warn('FB Player init failed', err);
            this.onNextItem();
          }
        }
      })
    }, 20);
  }

  onActiveTransitionClass() {
    const { type } = this.playlist.transition;
    switch (type) {
      case 'fade-in':
        return `opacity-0 animate-fade-in`;
      case 'slide-up':
        return `transform animate-slide-up`;
      case 'slide-down':
        return `transform animate-slide-down`;
      case 'slide-left':
        return `transform animate-slide-left`;
      case 'slide-right':
        return `transform animate-slide-right`;
      default:
        return '';
    }
  }

  onClearTimeout() {
    clearTimeout(this.timerId);
    clearTimeout(this.gapId);
    clearTimeout(this.transitionId);
    clearTimeout(this.fbTimerId);
    clearTimeout(this.ytTimerId);
  }

  onStopAllMedias() {
    const medias = document.querySelectorAll('video, audio');
    medias.forEach((m: any) => {
      const media = m as HTMLMediaElement;
      media.currentTime = 0;
      media.muted = true;
      media.pause();
    });
  }

  trackById(index: number, item: Assets | DesignLayout | any) {
    return item.contentId;
  }
}
