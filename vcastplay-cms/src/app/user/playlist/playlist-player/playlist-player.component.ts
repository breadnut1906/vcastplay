import { ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, inject, Input, Output, QueryList, signal, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { Playlist } from '../playlist';
import { Assets } from '../../assets/assets';
import { DesignLayout } from '../../design-layout/design-layout';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { UtilityService } from '../../../core/services/utility.service';
import { SafeurlPipe } from '../../../shared/pipes/safeurl.pipe';
import { PlaylistService } from '../playlist.service';
import { FacebookSDKService } from '../../../core/services/facebook-sdk.service';
import { DesignLayoutPreviewComponent } from '../../design-layout/design-layout-preview/design-layout-preview.component';
import { YoutubeSdkService } from '../../../core/services/youtube-sdk.service';
import { environment } from '../../../../environments/environment.development';
import { StorageService } from '../../../core/services/storage.service';

declare const FB: any;
declare const YT: any;

@Component({
  selector: 'app-playlist-player',
  imports: [ PrimengUiModule, SafeurlPipe, ], //forwardRef(() => DesignLayoutPreviewComponent) 
  templateUrl: './playlist-player.component.html',
  styleUrl: './playlist-player.component.scss',
})
export class PlaylistPlayerComponent {

  @Input() playlist!: Playlist | any;
  @Input() isAutoPlay = false;

  @Output() onCurrentItemChange = new EventEmitter<Assets | DesignLayout | any>();
  @Output() isPlayingChange = new EventEmitter<boolean>();

  // @ViewChild('fbPlayer') fbPlayerRef!: ElementRef<HTMLDivElement>;
  // @ViewChild('ytPlayer') ytPlayerRef!: ElementRef<HTMLDivElement>;

  @ViewChildren('ytPlayer') ytPlayersRef!: QueryList<ElementRef<HTMLDivElement>>[];
  @ViewChildren('fbPlayer') fbPlayersRef: QueryList<ElementRef<HTMLDivElement>>[] = [];

  playlistService = inject(PlaylistService);
  storage = inject(StorageService);
  utils = inject(UtilityService);
  fbService = inject(FacebookSDKService);
  ytService = inject(YoutubeSdkService);
  cdr = inject(ChangeDetectorRef);

  publicURL = environment.public;
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
  private fbPlayers = new Set<any>();

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
    const entries: number = this.playlist?.entries.length || 0;
    this.onClearTimeout();
    this.onStopAllMedias();
    this.currentIndex.set(0);
    await this.ytService.onLoadSDK();
    await this.fbService.onLoadSDK();

    if (entries > 0 && this.isAutoPlay) {
      this.currentItem.set(this.playlist.entries[0]);
      if (this.isAutoPlay || (fromChange && this.isPlaying())) {
        this.onStartPlayback();
      }
    }
  }

  onStartPlayback() {
    const entries: number = this.playlist.entries.length;
    if (entries == 0) return;
    this.isPlaying.set(true);
    this.currentItem.set(this.playlist.entries[this.currentIndex()]);

    const { asset } = this.currentItem();
    
    if (['image', 'html', 'design', 'link'].includes(asset.type)) this.onImageLoaded(this.currentItem());
    
    if (['audio'].includes(asset.type)) this.onAudioLoad();
    if (['video'].includes(asset.type)) this.onVideoLoad();

    if (asset.link) {
      if (asset.link.includes('facebook.com') || asset.link.includes('fb.watch')) this.onFacebookLoad();
      if (asset.link.includes('youtube.com') || asset.link.includes('youtu.be')) this.onYoutubeLoad();
    }

    this.onCurrentItemChange.emit(this.currentItem());
    this.isPlayingChange.emit(true);
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
    const { transition, isBlackGap } = this.playlist;
    const typeDuration = transition ? 300 : 0;
    const gapDuration = isBlackGap ? 1500 : 0;
    this.onClearTimeout();
    
    this.currentItem.set(null);
    this.transitionId = setTimeout(() => {

      this.gapId = setTimeout(() => {
        const isLoop: boolean = this.playlist.isLoop;
        const contents: number = this.playlist.entries.length;

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
        this.currentItem.set(this.playlist.entries[nextIndex]);
        
        const { asset } = this.currentItem();
        if (['image', 'html', 'design', 'link'].includes(asset.type)) this.onImageLoaded(this.currentItem());
        if (['audio'].includes(asset.type)) this.onAudioLoad();
        if (['video'].includes(asset.type)) this.onVideoLoad();
        if (asset.link) {
          if (asset.link.includes('facebook.com') || asset.link.includes('fb.watch')) this.onFacebookLoad();
          if (asset.link.includes('youtube.com') || asset.link.includes('youtu.be')) this.onYoutubeLoad();
        }
        
        // if (['image', 'web', 'design'].includes(this.currentItem().type)) this.onImageLoaded(this.currentItem());
        // if (this.currentItem().type == 'audio') this.onAudioLoad();
        // if (this.currentItem().type == 'video') this.onVideoLoad();
        // if (this.currentItem().type == 'facebook') this.onFacebookLoad();
        // if (this.currentItem().type == 'youtube') this.onYoutubeLoad();

        this.onCurrentItemChange.emit(this.currentItem());
        // this.onPreloadNextItem();
        
      }, gapDuration);

    }, typeDuration);    
  }

  onPreloadNextItem() {
    const nextIndex = (this.currentIndex() + 1) % this.playlist.entries.length;
    this.nextPreloadedItem.set(this.playlist.entries[nextIndex]);
  }

  onVideoLoad() {
    const content: any = this.currentItem();
    Promise.resolve().then(() => {
      const videos = document.querySelectorAll('video');
      for (const v of videos) {
        if (v.id == content.sequence) {
          v.currentTime = 0;
          v.muted = false;
          v.play()
        }
      };
    })
  }

  // For Image and Web links
  onImageLoaded(item: any) {
    const duration = item.duration * 1000 || 5000;    
    this.timerId = setTimeout(() => this.onNextItem(), duration);
  }

  onIFrameLoad(item: any) {
    if (item.asset.type == 'web') return item.asset.link;
    else return '';
  }

  onAudioLoad() {
    const content: any = this.currentItem();
    Promise.resolve().then(() => {
      const audios = document.querySelectorAll('audio');
      for (const a of audios) {
        if (a.id == content.sequence) {
          a.currentTime = 0;
          a.play();
        }
      }
    })
  }
  
  async onYoutubeLoad() {
    this.ytTimerId = setTimeout(async () => {
      const item = this.currentItem();
      const { videoId } = this.utils.onGetEmbedUrl(item.asset.link);

      this.ytPlayersRef.forEach((player: any) => {
        const playerEl = player.nativeElement;
        if (!playerEl) return;

        if (item.sequence == playerEl.id) {

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
        this.fbService.onFacebookParse(playerEl);

        if (item.sequence == playerEl.id) {
          try {
            await FB.Event.unsubscribe('xfbml.ready');
            await FB.Event.subscribe('xfbml.ready', async (msg: any) => {
              this.isFacebookLoading.set(false);
              if (msg.type === 'video' && msg.instance) {
                fbPlayer = msg.instance;
                fbPlayer.play();
              
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
                  iframe.setAttribute('allow', 'accelerometer; ambient-light-sensor; camera; encrypted-media; fullscreen; geolocation; gyroscope; magnetometer; microphone; payment; picture-in-picture');
                }
                
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

          } catch (err) {
            console.warn('FB Player init failed', err);
            this.onNextItem();
          }
        }
      })

      this.cdr.detectChanges();
    }, 20);
  }

  onActiveTransitionClass() {
    const { transition } = this.playlist;
    switch (transition) {
      case 'fade':
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

    // this.fbPlayersRef.forEach((player: any) => {
    //   const playerEl = player.nativeElement;
    //   if (!playerEl) return;
    //   console.log(playerEl);
      
    // })
  }

  trackById(index: number, item: any) {
    return item.sequence;
  }

  isFacebook(item: Assets) { 
    return item.link.includes('facebook.com') || item.link.includes('fb.watch');
  }

  isYoutube(item: Assets) { 
    return item.link.includes('youtube.com') || item.link.includes('youtu.be');
  }

  get tenantId() { return this.storage.get('id'); }
}
