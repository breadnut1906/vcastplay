import { Component, ElementRef, EventEmitter, inject, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FacebookSDKService } from '../../../core/services/facebook-sdk.service';
import { YoutubeSdkService } from '../../../core/services/youtube-sdk.service';
import { UtilityService } from '../../../core/services/utility.service';
import { SafeurlPipe } from '../../../shared/pipes/safeurl.pipe';
import { Assets } from '../assets';
import { MessageService } from 'primeng/api';

declare const FB: any;
declare const YT: any;

@Component({
  selector: 'app-asset-preview',
  imports: [ SafeurlPipe ],
  templateUrl: './asset-preview.component.html',
  styleUrl: './asset-preview.component.scss'
})
export class AssetPreviewComponent {

  @Input() asset!: Assets | any;
  @Input() showControls: boolean = false;
  @Input() autoPlay: boolean = false;
  @Input() link: string = '';

  @Output() onPropertiesChange = new EventEmitter<any>();

  @ViewChild('fbPlayer') fbPlayerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('ytPlayer') ytPlayerRef!: ElementRef<HTMLDivElement>;

  utils = inject(UtilityService);
  fbService = inject(FacebookSDKService);
  ytService = inject(YoutubeSdkService);
  message = inject(MessageService);

  private fbTimerId: any;
  private ytTimerId: any;

  ngOnChanges(changes: SimpleChanges) {
    clearTimeout(this.fbTimerId);  
    clearTimeout(this.ytTimerId);    
    if (changes['asset'] && changes['asset'].currentValue) {
      const link = changes['asset'].currentValue?.link;
      if (link?.includes('facebook.com') || link?.includes('fb.watch')) this.onFacebookLoad();
      if (link?.includes('youtube.com') || link?.includes('youtu.be')) this.onYoutubeLoad();
    }
  }

  async onYoutubeLoad() {
    await this.ytService.onLoadSDK()
    this.ytTimerId = setTimeout(async () => {
      const ytPlayer = this.ytPlayerRef?.nativeElement;
      const { videoId } = this.utils.onGetEmbedUrl(this.asset.link);
      if (!ytPlayer) return;
      
      try {
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
              this.onPropertiesChange.emit({ duration, name: title, orientation, dimension: `${width}x${height}` });
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
              this.message.add({ severity: 'error', summary: 'Error', detail: event.data });
              this.onPropertiesChange.emit(null);
            }
          }
        })  
      } catch (error: any) {
        this.message.add({ severity: 'error', summary: 'Error', detail: error.message });
        this.onPropertiesChange.emit(null);
      }
    }, 10);
  }
  
  async onFacebookLoad() { 
    let player: any;
    await this.fbService.onLoadSDK();
    const fbPlayer = this.fbPlayerRef?.nativeElement;
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
            }
            
            const width = iframe.offsetWidth;
            const height = iframe.offsetHeight;
            const orientation = width > height ? 'landscape' : 'portrait';
            const dimension = `${width}x${height}`;
            const duration = Math.ceil(player.getDuration());           
            
            this.onPropertiesChange.emit({ name: 'Facebook Video', dimension, orientation, duration });
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
        this.message.add({ severity: 'error', summary: 'Error', detail: err });
        this.onPropertiesChange.emit(null);
      });

    } catch (err) {
      this.message.add({ severity: 'error', summary: 'Error', detail: `Failed to init facebook player` });
      this.onPropertiesChange.emit(null);
    }
  }

  get isTypeLink() { return this.asset.type === 'link'; }
  get isFacebook() { return this.asset.link.includes('facebook'); }
  get isYoutube() { return this.asset.link.includes('youtube'); }
}
