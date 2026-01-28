import { ChangeDetectorRef, Component, effect, inject, signal } from '@angular/core';
import { PrimengModule } from '../core/modules/primeng/primeng.module';
import { UtilsService } from '../core/services/utils.service';
import { PlayerService } from '../core/services/player.service';
import { IndexedDbService } from '../core/services/indexed-db.service';
import { ComponentsModule } from '../core/modules/components/components.module';
import { StorageService } from '../core/services/storage.service';
import { PlatformService } from '../core/services/platform.service';
import { MessageService } from 'primeng/api';
import { WebsocketService } from '../core/services/websocket.service';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-main-display',
  imports: [ PrimengModule, ComponentsModule, ],
  templateUrl: './main-display.component.html',
  styleUrl: './main-display.component.scss',
})
export class MainDisplayComponent {

  platformService = inject(PlatformService);
  indexedDB = inject(IndexedDbService);
  webSocket = inject(WebsocketService);
  storage = inject(StorageService);
  message = inject(MessageService);
  player = inject(PlayerService);
  utils = inject(UtilsService);
  
  screenKey: string = environment.screenKey;

  isPlay = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  showSettings = signal<boolean>(false);
  loadingProgress = signal<number>(0);
  currentContent: any;
  nextCurrent: any;


  constructor(private cdr: ChangeDetectorRef) {

    effect(() => {
      const data = this.player.playerContent();
      const broadcast = this.player.playerBroadcast();
      const healthCheck = this.player.isStartHealthCheck();

      if (data) this.webSocket.onEmit('response-update', { response: `Player has started` })

      if (broadcast) this.webSocket.onEmit('response-update', { response: `Player is broadcasting...` })

      if (healthCheck) this.webSocket.onEmit('response-update', { response: `Player is checking health...` })
    })
  }

  async ngOnInit() {
    const platform = this.storage.get('platform');
    console.log(`System has been initialized in ${platform.toUpperCase()}`);

    const items = await this.indexedDB.getAllItems();
    if (items.length > 0) {
      this.player.playerContent.set({ type: 'asset', content: items[0] });
      this.webSocket.onEmit('response-update', { response: `Player has started` })
      // this.isPlay.set(true);
    }
  }

  ngOnDestroy() {
    this.webSocket.onEmit('display-status', { status: 'off' })
  }

  async ngAfterViewInit() {
    this.onGetPlayerInformation();
    this.cdr.detectChanges();

    // Send message to CMS that the display is online
    this.webSocket.onEmit('display-status', { status: 'on' })
  }

  // onClikcStopPreview() {
  //   this.player.onSetContent('stop');
  //   if (this.platform == 'desktop') this.utils.onDeleteFolder('vcastplay');
  //   this.indexedDB.clearItems();
  //   this.storage.remove('currentContent');
  //   this.storage.remove('type');
  //   this.currentContent = null;
  //   this.isPlay.set(false)
  // }

  // async onClickSetContent(type: string) {
  //   this.loadingProgress.set(0);
  //   this.isLoading.set(true);

  //   if (this.currentContent && !['design', 'design2'].includes(type)) this.nextCurrent = this.currentContent
  //   else this.currentContent = null;

  //   const content: any = this.player.onSetContent(type);
  //   console.log('🧭 New Content detected:', content);
    
  //   const files: any[] = !['playlist', 'playlist2', 'design', 'design2'].includes(type) ? [ content ] : content.files;

  //   await this.indexedDB.clearItems();

  //   const totalFiles = files.length;
  //   await Promise.all(files.map(async (file: any) => {
  //     // console.log('🧭 Downloading File:', file);
  //     // this.loadingProgress.set(this.loadingProgress()+1)
  //     if (!['facebook', 'youtube', 'web'].includes(file.type)) {
  //       try {
  //         const res = await fetch(file.link);
  //         const blob = await res.blob();
  //         await this.indexedDB.addItem({ file, blob });
  //       } catch (error: any) {
  //         console.log('🧭 Error downloading file:', error);
  //       }
  //     }
  //     this.loadingProgress.set(this.loadingProgress() + (100 / totalFiles));
  //   }));

  //   const timerDuration = ['facebook', 'youtube', 'design', 'design2'].includes(type) ? 800 : 0;

  //   setTimeout(() => {
  //     this.currentContent = content;

  //     // const currentContent = this.utils.encrypt(JSON.stringify(content));
  //     // this.storage.set('type', type);
  //     // this.storage.set('currentContent', currentContent);
      
  //     this.isPlay.set(true);
  //     this.isLoading.set(false);
  //     this.nextCurrent = null;
  //   }, timerDuration);
  //   // console.log('🧭 Content set:', content);
  // }

  // onClickNotepad() {
  //   this.player.sendApp('notepad')
  // }

  async onGetPlayerInformation() {
    const platform = this.storage.get('platform');
    const uniqueId = this.storage.get('uniqueId');
    const code = this.storage.get('code');
    const appVersion = this.storage.get('appVersion');
    this.systemInfo.set({ uniqueId, platform, code, appVersion });
  }
  
  trackById(index: number, item: any): any {
    return { id: index, contentId: item.contentId } 
  }

  get isDev() { return this.utils.isDev; }

  get isElectron() { return window.system?.isElectron; }

  get playerCode() { return this.player.playerCode; }
  get systemInfo() { return this.player.systemInfo; }
  get androidData() { return this.player.androidData(); }
  get playerContent() { return this.player.playerContent(); }
  get playerBroadcast() { return this.player.playerBroadcast(); }

  get platform() { return this.platformService.platform; }
  get dataFromAndroid() { return this.player.dataFromAndroid; }

  get isOnline() {
    return this.webSocket.isOnline();
  }

  get tenantId() { return this.storage.get('tenantId'); }
}
