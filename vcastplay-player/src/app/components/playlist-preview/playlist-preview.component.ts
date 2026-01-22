import { Component, ElementRef, EventEmitter, forwardRef, inject, Input, Output, QueryList, signal, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { Playlist } from '../../core/interfaces/playlist';
import { Assets } from '../../core/interfaces/assets';
import { DesignLayout } from '../../core/interfaces/design-layout';
import { UtilsService } from '../../core/services/utils.service';
import { FacebookSdkService } from '../../core/services/facebook-sdk.service';
import { YoutubeSdkService } from '../../core/services/youtube-sdk.service';
import { PrimengModule } from '../../core/modules/primeng/primeng.module';
import { SafeurlPipe } from '../../core/pipes/safeurl.pipe';
import { DesignLayoutPreviewComponent } from '../design-layout-preview/design-layout-preview.component';
import { IndexedDbService } from '../../core/services/indexed-db.service';

declare const FB: any;
declare const YT: any;

@Component({
  selector: 'app-playlist-preview',
  imports: [ PrimengModule, SafeurlPipe, forwardRef(() => DesignLayoutPreviewComponent) ],
  templateUrl: './playlist-preview.component.html',
  styleUrl: './playlist-preview.component.scss'
})
export class PlaylistPreviewComponent {

  @Input() playlist!: Playlist;
  @Input() isAutoPlay: boolean = false;

  @Output() onCurrentItemChange = new EventEmitter<Assets | DesignLayout | any>();
  @Output() isPlayingChange = new EventEmitter<boolean>();

  @ViewChildren('video') videoRef!: QueryList<ElementRef<HTMLVideoElement>>[];
  @ViewChildren('image') imageRef!: QueryList<ElementRef<HTMLImageElement>>[];
  @ViewChildren('audio') audioRef!: QueryList<ElementRef<HTMLAudioElement>>[];
  @ViewChildren('iframe') iframeRef!: QueryList<ElementRef<HTMLIFrameElement>>[];
  @ViewChildren('ytPlayer') ytPlayersRef!: QueryList<ElementRef<HTMLDivElement>>[];
  @ViewChildren('fbPlayer') fbPlayersRef!: ElementRef<HTMLDivElement>[];

  fbService = inject(FacebookSdkService);
  ytService = inject(YoutubeSdkService);
  indexedDB = inject(IndexedDbService);
  utils = inject(UtilsService);

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
  private indexDBItems: any[] = [];
  

  async ngOnInit() {
    await this.ytService.onLoadSDK();
    await this.fbService.onLoadSDK();
    this.indexDBItems = await this.indexedDB.getAllItems();
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
    this.currentIndex.set(0);

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

    if (['image'].includes(this.currentItem().type)) this.onImageLoaded(this.currentItem());
    if (['design'].includes(this.currentItem().type)) this.onDesignLoad(this.currentItem());
    if (['video'].includes(this.currentItem().type)) this.onVideoLoad(this.currentItem());
    if (['audio'].includes(this.currentItem().type)) this.onAudioLoad(this.currentItem());
    if (['facebook'].includes(this.currentItem().type)) this.onFacebookLoad();
    if (['youtube'].includes(this.currentItem().type)) this.onYoutubeLoad();
    
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
        
        if (['image'].includes(this.currentItem().type)) this.onImageLoaded(this.currentItem());
        if (['design'].includes(this.currentItem().type)) this.onDesignLoad(this.currentItem());
        if (['video'].includes(this.currentItem().type)) this.onVideoLoad(this.currentItem());
        if (['audio'].includes(this.currentItem().type)) this.onAudioLoad(this.currentItem());
        if (['facebook'].includes(this.currentItem().type)) this.onFacebookLoad();
        if (['youtube'].includes(this.currentItem().type)) this.onYoutubeLoad();

        this.onCurrentItemChange.emit(this.currentItem());

      }, gapDuration);

    }, typeDuration);    
  }

  onPreloadNextItem() {
    const nextIndex = (this.currentIndex() + 1) % this.playlist.contents.length;
    this.nextPreloadedItem.set(this.playlist.contents[nextIndex]);
  }

  async onVideoLoad(item: Assets | DesignLayout | any) {
    const videoSource = await this.onGetCurrentItemSource(item);
    if (!videoSource) return;

    this.videoRef.forEach((video: any) => {
      const videoEl = video.nativeElement;
      if (videoEl.id == item.contentId) {        
        videoEl.src = videoSource;
        videoEl.currentTime = 0;
        videoEl.muted = false;
      }
    })
  }

  // For Image and Web links
  async onImageLoaded(item: Assets | DesignLayout | any) {
    const imageSource = await this.onGetCurrentItemSource(item);
    if (!imageSource) return;
    
    this.imageRef.forEach((image: any) => {      
      const imageEl = image.nativeElement;
      if (imageEl.id == item.contentId) {
        imageEl.src = imageSource;
      }
    })

    const duration = item.duration * 1000 || 5000;    
    this.timerId = setTimeout(() => this.onNextItem(), duration);
  }
  
  async onAudioLoad(item: Assets | DesignLayout | any) {
    // Promise.resolve().then(async () => {
    //   const audios = document.querySelectorAll('audio');
    //   for (const a of audios) {
    //     if (a.id == item.contentId) {
    //       const audioSource = await this.onGetCurrentItemSource(item);
    //       a.src = audioSource || '';
    //       a.currentTime = 0;
    //       a.play();
    //     }
    //   }
    // })
    const audioSource = await this.onGetCurrentItemSource(item);
    if (!audioSource) return;

    this.audioRef.forEach((audio: any) => {
      const audioEl = audio.nativeElement;
      if (audioEl.id == item.contentId) {
        audioEl.src = audioSource;
        audioEl.currentTime = 0;
        // audioEl.play();
      }
    })
  }

  onDesignLoad(item: DesignLayout) {
    const duration = item.duration * 1000 || 5000;    
    this.timerId = setTimeout(() => this.onNextItem(), duration);
  }

  onIFrameLoad(item: Assets) {
    if (item.type == 'web') return item.url;
    else return '';
  }
  
  async onYoutubeLoad() {
    this.ytTimerId = setTimeout(async () => {
      const item = this.currentItem();
      const { videoId } = this.utils.onGetEmbedUrl(item.url);

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
                player.unMute();
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
                fbPlayer.unmute();
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

  async onGetCurrentItemSource(currentItem: Assets | DesignLayout | any) {
    const file: any = await this.indexDBItems.find((item: any) => item.file.name == currentItem.name);
    if (!file) return null;

    return URL.createObjectURL(file.blob);
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

  async onMediaError(item: Assets | DesignLayout | any) {
    console.log(`Media Error Load: ${item.name}`);
    this.onNextItem();
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
