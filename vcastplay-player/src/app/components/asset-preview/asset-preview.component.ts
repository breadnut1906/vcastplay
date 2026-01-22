import { Component, ElementRef, EventEmitter, inject, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UtilsService } from '../../core/services/utils.service';
import { FacebookSdkService } from '../../core/services/facebook-sdk.service';
import { YoutubeSdkService } from '../../core/services/youtube-sdk.service';
import { Assets } from '../../core/interfaces/assets';
import { SafeurlPipe } from '../../core/pipes/safeurl.pipe';
import { IndexedDbService } from '../../core/services/indexed-db.service';

declare const FB: any;
declare const YT: any;

@Component({
  selector: 'app-asset-preview',
  imports: [ SafeurlPipe ],
  templateUrl: './asset-preview.component.html',
  styleUrl: './asset-preview.component.scss'
})
export class AssetPreviewComponent {

  @Input() asset!: Assets;
  @Input() showControls: boolean = false;
  @Input() autoPlay: boolean = false;

  @Output() onPropertiesChange = new EventEmitter<any>();

  @ViewChild('video', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('image', { static: false }) imageRef!: ElementRef<HTMLImageElement>;
  @ViewChild('audio', { static: false }) audioRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('iframe', { static: false }) iframeRef!: ElementRef<HTMLIFrameElement>;
  @ViewChild('fbPlayer') fbPlayerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('ytPlayer') ytPlayerRef!: ElementRef<HTMLDivElement>;

  fbService = inject(FacebookSdkService);
  ytService = inject(YoutubeSdkService);
  indexedDB = inject(IndexedDbService);
  utils = inject(UtilsService);

  private fbTimerId: any;
  private ytTimerId: any;
  
  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    clearTimeout(this.fbTimerId);  
    clearTimeout(this.ytTimerId);
    if (changes['asset'] && changes['asset'].currentValue) {
      if (this.isFacebook) this.onFacebookLoad();
      else if (this.isYoutube) this.onYoutubeLoad();
      else this.onMediaLoad(this.asset.type);
    }
  }

  async onMediaLoad(type: string) {
    const items: any = await this.indexedDB.getAllItems();
    const file: any = items.find((item: any) => item.name == this.asset.name);      
    if (!file) return;

    const tempLink = URL.createObjectURL(file.url);
    console.log(tempLink);
    
    switch (type) {
      case 'video':
        const video = this.videoRef?.nativeElement;          
        video.src = tempLink;
        video.currentTime = 0;
        video.preload = 'auto';
        video.play();
        break;
      case 'audio':
        const audio = this.audioRef?.nativeElement;
        audio.src = tempLink;
        audio.load()
        audio.currentTime = 0;
        audio.preload = 'auto';
        audio.play();
        break;
      case 'image':
        const image = this.imageRef?.nativeElement;        
        image.src = tempLink;
        break;
    }
  }

  async onYoutubeLoad() {
    await this.ytService.onLoadSDK()
    this.ytTimerId = setTimeout(async () => {
      const ytPlayer = this.ytPlayerRef?.nativeElement;
      const { videoId } = this.utils.onGetEmbedUrl(this.asset.url);
      if (!ytPlayer) return;
      
      const player = await new YT.Player(ytPlayer, {
        videoId,
        playerVars: {
          autoPlay: this.autoPlay ? 1 : 0,
          controls: this.showControls ? 1 : 0,
          loop: 1, 
          playsinline: 1, 
          showinfo: 0
        },
        events: {
          onReady: (event: any) => {
            if (this.autoPlay) player.playVideo();
            
            const { width, height }: any = event.target.getSize();
            const { title }: any = event.target.getVideoData();
            const duration = event.target.getDuration();
            
            const orientation = width > height ? 'landscape' : 'portrait';
            this.onPropertiesChange.emit({ duration, title, type: 'youtube', orientation });
          },
          onStateChange: (event: any) => {
            if (this.autoPlay) {
              if (event.data == YT.PlayerState.ENDED) {
                player.seekTo(0);
                player.playVideo();
              }
            }
          },
          onError: (event: any) => {
            console.warn('YouTube player error:', event.data);
          }
        }
      })  
    }, 10);
  }
  
  async onFacebookLoad() { 
    let player: any;
    await this.fbService.onLoadSDK();
    const fbPlayer = this.fbPlayerRef?.nativeElement;
    
    const iframeYT = document.querySelector('iframe');
    if (iframeYT) iframeYT.remove();

    if (!fbPlayer) return;    
    this.fbService.onFacebookParse(fbPlayer);
    const iframe = fbPlayer.querySelector('iframe');
    if (!iframe) return;      
    try {
      await FB.Event.unsubscribe('xfbml.ready');
      await FB.Event.subscribe('xfbml.ready', async (msg: any) => {        
        if (msg.type === 'video' && msg.instance) {
          this.fbTimerId = setTimeout(async () => {        
            player = msg.instance;
            if (this.autoPlay) {
              await player.play();
              player.subscribe('finishedPlaying', () => {
                player.seek(0);
                player.play();
              })
              player.subscribe('error', (err: any) => {
                console.warn('FB Player error:', err);
              })
            }
            
            const width = iframe.offsetWidth;
            const height = iframe.offsetHeight;
            const orientation = width > height ? 'landscape' : 'portrait';
            const duration = Math.ceil(player.getDuration());
            this.onPropertiesChange.emit({ width, height, orientation, duration, type: 'facebook' });
            if (iframe) {
              const scale = orientation == 'landscape' ? 1 : fbPlayer.clientHeight / iframe.clientHeight;
              
              iframe.style.position = 'absolute';
              iframe.style.top = '50%';
              iframe.style.left = '50%';
              iframe.style.transformOrigin = 'center center';
              iframe.style.border = 'none';
              iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;
            }
          }, 500);
        }
    
      });
      await FB.Event.subscribe('xfbml.error', (err: any) => {
        console.warn('FB Player error:', err);
      });

    } catch (err) {
      console.warn('FB Player init failed', err);
    }
  }
  
  get isFacebook() {
    const url = this.asset.url;
    return typeof url === 'string' && url.includes('facebook') && !url.startsWith('blob:');
  }
  
  get isYoutube() {
    const url = this.asset.url;
    return typeof url === 'string' && url.includes('youtube') && !url.startsWith('blob:');
  }
}
