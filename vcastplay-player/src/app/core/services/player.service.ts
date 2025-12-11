import { computed, inject, Injectable, signal } from '@angular/core';
import { Playlist, Playlists } from '../interfaces/playlist';
import { PlatformService } from './platform.service';
import { environment } from '../../../environments/environment.development';
import { Assets } from '../interfaces/assets';
import { DesignLayout } from '../interfaces/design-layout';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

    platform = inject(PlatformService);

    private contentSignal = signal<Assets | DesignLayout | Playlists | any>(null);
    playerContent: Assets | DesignLayout | Playlists | any = computed(() => this.contentSignal());

    androidPath: string = environment.androidFilePath;
    systemInfo = signal<any>(null);
    playerCode = signal<string>('');

    androidData = signal<any>(null);
    dataFromAndroid = signal<any>(null);
    isContentLogs = signal<any>(null);
    showTenantDIalog = signal<any>(null);

    constructor() { }

    onLoadContents() { 
        this.contentSignal.set(null); 
    }

    onSetContent(type: string) {
        console.log('save to contentSignal()');
    }

    onGetContents() {
        if (this.contentSignal().length === 0) this.onLoadContents();
        return this.contentSignal();
    }
    
    send(action: string) {
        window.system.control(action)
        .then(response => console.log(response))
        .catch(err => console.error(err));
    }

    sendApp(app: string) {
        window.system.control("open", app)
        .then(response => console.log(response));
    }

    closeApp(app: string) {
        window.system.control("close", app)
        .then(response => console.log(response));
    }

    screenShot() {
        window.system.takeScreenshot()
        .then(response => console.log(response))
        .catch(err => console.error(err));
    }

    onGetDesktopInformation() {
        window.system.getSystemInfo()
        .then((response: any) => {        
            console.log(response);
            console.log(this.systemInfo());
            // this.requestLocation();
        })
        .catch(err => console.error(err));
    }
    
    onGetAndroidInformation() {
        window.getDeviceDetails = (data: any) => {
        console.log('Received from android device details:', data);
        // You can update Angular state here if needed
        this.androidData.set(data);
        };
    }
    
    onGetBrowserInformation() {
        const { appVersion, appName, platform, userAgent }: any = navigator;
        const height = screen.height;
        const width = screen.width;
        const orientation = screen.orientation;
        console.log({ appVersion, appName, platform, userAgent, height, width, orientation });
    }

    onSendDataToAndroid(data: any) {
        if ((window as any).AndroidBridge && typeof (window as any).AndroidBridge.sendCommand === 'function') {
        const jsonData = JSON.stringify(data);
        console.log(jsonData);
        (window as any).AndroidBridge.sendCommand(jsonData);
        } else {
        console.warn('AndroidBridge not available.');
        }
    }
    
    onSendDataToDesktop(data: any) {
        window.system.onSendContentLogs(JSON.stringify(data));
    }
}
