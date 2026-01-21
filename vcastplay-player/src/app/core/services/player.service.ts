import { computed, inject, Injectable, signal } from '@angular/core';
import { Playlist, Playlists } from '../interfaces/playlist';
import { PlatformService } from './platform.service';
import { environment } from '../../../environments/environment.development';
import { Assets } from '../interfaces/assets';
import { DesignLayout } from '../interfaces/design-layout';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

    platform = inject(PlatformService);
    http = inject(HttpClient);

    api: string = environment.api;
    apiKey: string = environment.apiKey;

    private contentSignal = signal<Assets | DesignLayout | Playlists | any>(null);
    playerContent: Assets | DesignLayout | Playlists | any = computed(() => this.contentSignal());

    systemInfo = signal<any>(null);
    playerCode = signal<string>('');

    androidData = signal<any>(null);
    dataFromAndroid = signal<any>(null);
    isContentLogs = signal<any>(null);
    showTenantDIalog = signal<any>(null);

    playerLoading = signal<boolean>(false);

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
        this.playerLoading.set(true);
        return new Promise((resolve, reject) => {
            window.system.getSystemInfo()
            .then((response: any) => {
                this.playerLoading.set(false);
                resolve(response);
            })
            .catch(err => {
                this.playerLoading.set(false);
                console.error('Error getting desktop system info:', err);
                reject(err);
            });
        });
    }
    
    onGetAndroidInformation() {
        (window as any).AndroidBridge = (window as any).AndroidBridge || {};

        // Android → JS callback
        (window as any).AndroidBridge.onDeviceDetails = (data: any) => {
            console.log('Received from android device details:', data);
            this.androidData.set(data);
        };

        // JS → Android request
        if (typeof (window as any).AndroidBridge.requestDeviceDetails === 'function') {
            (window as any).AndroidBridge.requestDeviceDetails();
        } else {
            console.warn('AndroidBridge.requestDeviceDetails not available yet');
        }
    }
    
    onGetBrowserInformation() {
        const { appVersion, appName, platform, userAgent }: any = navigator;
        const height = screen.height;
        const width = screen.width;
        const orientation = height < width ? 'landscape' : 'portrait';
        return { appVersion, appName, platform, userAgent, height, width, orientation };
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

    onRegisterPlayer(body: any) {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'x-api-key': this.apiKey });
        return this.http.post(`${this.api}admin/screens`, body, { headers });
    }
}
