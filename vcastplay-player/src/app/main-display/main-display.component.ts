import { ChangeDetectorRef, Component, effect, inject, signal } from '@angular/core';
import { PrimengModule } from '../core/modules/primeng/primeng.module';
import { NetworkService } from '../core/services/network.service';
import { UtilsService } from '../core/services/utils.service';
import { PlayerService } from '../core/services/player.service';
import { IndexedDbService } from '../core/services/indexed-db.service';
import { ComponentsModule } from '../core/modules/components/components.module';
import { StorageService } from '../core/services/storage.service';
import { PlatformService } from '../core/services/platform.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { WebsocketService } from '../core/services/websocket.service';

@Component({
  selector: 'app-main-display',
  imports: [ PrimengModule, ComponentsModule, ],
  templateUrl: './main-display.component.html',
  styleUrl: './main-display.component.scss',
})
export class MainDisplayComponent {

  // webSocket = inject(WebsocketService);
  platformService = inject(PlatformService);
  networkService = inject(NetworkService);
  indexedDB = inject(IndexedDbService);
  player = inject(PlayerService);
  storage = inject(StorageService);
  message = inject(MessageService);
  utils = inject(UtilsService);

  isPlay = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  showSettings = signal<boolean>(false);
  loadingProgress = signal<number>(0);
  currentContent: any;
  nextCurrent: any;

  settingsForm: FormGroup = new FormGroup({
    fullscreen: new FormControl(false),
    resizable: new FormControl(true),
    top: new FormControl(0),
    left: new FormControl(0),
    width: new FormControl(600),
    height: new FormControl(800),
    alwaysOn: new FormControl(false),
    alwaysOnTop: new FormControl(false),
    contentLogs: new FormControl(false),
    toggleAudio: new FormControl(false),
    audio: new FormControl(false),
    displayId: new FormControl(null),
  });

  displayOptions: MenuItem[] = [];

  constructor(private cdr: ChangeDetectorRef) {
    const platform = this.storage.get('platform');
    window.addEventListener('online', () => this.networkStat.set(true));
    window.addEventListener('offline', () => this.networkStat.set(false));

    effect(() => {
      console.log('🧭 Network status changed:', this.networkStat());
      console.log(`System has been initialized in ${platform.toUpperCase()}`);       
      // this.systemInfo = { ...this.systemInfo, coords: this.utils.location() };
    })

    /**
     * Receive data from Android
     * Play content on Android
     */
    // window.receiveDataFromAndroid = (data: any) => {
    //   if (data) {
    //     console.log('🧭 Data received from Android:', data);
    //     // setTimeout(() => this.isPlay.set(true), this.timeout);
    //   } else {
    //     console.log('🧭 Data received from Android is empty');
    //   }
    // }
  }

  async ngOnInit() {
    const content = this.storage.get('currentContent');
    if (content) {
      const type = this.storage.get('type'); 
      const timerDuration = ['facebook', 'youtube', 'design', 'design2'].includes(type) ? 800 : 0;
      const decryptContent = this.utils.decrypt(content);
      setTimeout(() => {
        this.currentContent = JSON.parse(decryptContent);
        this.isPlay.set(true);
      }, timerDuration);
    }
  }

  async ngAfterViewInit() {
    this.onGetPlayerInformation();
    this.cdr.detectChanges();
  }

  onClikcStopPreview() {
    this.player.onSetContent('stop');
    if (this.platform == 'desktop') this.utils.onDeleteFolder('vcastplay');
    this.indexedDB.clearItems();
    this.storage.remove('currentContent');
    this.storage.remove('type');
    this.currentContent = null;
    this.isPlay.set(false)
  }

  async onClickSetContent(type: string) {
    this.loadingProgress.set(0);
    this.isLoading.set(true);

    if (this.currentContent && !['design', 'design2'].includes(type)) this.nextCurrent = this.currentContent
    else this.currentContent = null;

    const content: any = this.player.onSetContent(type);
    console.log('🧭 New Content detected:', content);
    
    const files: any[] = !['playlist', 'playlist2', 'design', 'design2'].includes(type) ? [ content ] : content.files;

    await this.indexedDB.clearItems();

    const totalFiles = files.length;
    await Promise.all(files.map(async (file: any) => {
      // console.log('🧭 Downloading File:', file);
      // this.loadingProgress.set(this.loadingProgress()+1)
      if (!['facebook', 'youtube', 'web'].includes(file.type)) {
        try {
          const res = await fetch(file.link);
          const blob = await res.blob();
          await this.indexedDB.addItem({ file, blob });
        } catch (error: any) {
          console.log('🧭 Error downloading file:', error);
        }
      }
      this.loadingProgress.set(this.loadingProgress() + (100 / totalFiles));
    }));

    const timerDuration = ['facebook', 'youtube', 'design', 'design2'].includes(type) ? 800 : 0;

    setTimeout(() => {
      this.currentContent = content;

      // const currentContent = this.utils.encrypt(JSON.stringify(content));
      // this.storage.set('type', type);
      // this.storage.set('currentContent', currentContent);
      
      this.isPlay.set(true);
      this.isLoading.set(false);
      this.nextCurrent = null;
    }, timerDuration);
    // console.log('🧭 Content set:', content);
  }

  onClickNotepad() {
    this.player.sendApp('notepad')
  }

  onGetPlayerInformation() {
    const platform = this.storage.get('platform');
    const code = this.storage.get('code');
    const playerCode = this.storage.get('playerCode');
    const appVersion = this.storage.get('appVersion');
    this.systemInfo.set({ code, platform, playerCode, appVersion })   
   
    switch (platform) {
      case 'android':
        this.player.onSendDataToAndroid({ code, platform, playerCode, appVersion });
        this.player.onGetAndroidInformation();
        console.log(this.androidData());
        break;
      case 'desktop':
        this.player.onGetDesktopInformation();
        break;
      default:
        this.player.onGetBrowserInformation();
        break;
    }
  }

  onClickAndroidBtn(data: string) {
    this.player.onSendDataToAndroid({ data });
  }

  onClickApplySettings() {
    const platform = this.storage.get('platform');
    const { contentLogs } = this.settingsForm.value;
    this.isContentLogs.set(contentLogs);
    if (['android'].includes(platform)) this.player.onSendDataToAndroid(this.settingsForm.value);
    if (['desktop'].includes(platform)) window.system.onSendWindowData(this.settingsForm.value);
  }

  onClickClearLogs() {
    const platform = this.storage.get('platform');
    if (['android'].includes(platform)) this.player.onSendDataToAndroid({ clearLogs: true });
    if (['desktop'].includes(platform)) {
      window.system.onDeleteContentLogs()
        .then((res) => this.message.add({ severity:'success', summary: 'Success', detail: res }))
    }
  }

  onShowSettings() {
    window.system.onGetDisplays()
      .then((displays) => {
        this.displayOptions = displays;
      })
  }
  
  trackById(index: number, item: any): any {
    return { id: index, contentId: item.contentId } 
  }

  get isDev() { return this.utils.isDev; }

  get isElectron() { return window.system?.isElectron; }
  
  get networkStat() { return this.networkService.networkStat; }

  get playerCode() { return this.player.playerCode; }
  get systemInfo() { return this.player.systemInfo; }
  get androidData() { return this.player.androidData; }
  get playerContent() { return this.player.playerContent; }
  get isContentLogs() { return this.player.isContentLogs; }

  get platform() { return this.platformService.platform; }
  get dataFromAndroid() { return this.player.dataFromAndroid; }
}
