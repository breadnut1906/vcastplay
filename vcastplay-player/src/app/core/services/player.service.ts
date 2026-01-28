import { computed, inject, Injectable, signal } from '@angular/core';
import { Playlist, Playlists } from '../interfaces/playlist';
import { PlatformService } from './platform.service';
import { environment } from '../../../environments/environment.development';
import { Assets } from '../interfaces/assets';
import { DesignLayout } from '../interfaces/design-layout';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IndexedDbService } from './indexed-db.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

    storage = inject(StorageService);
    platform = inject(PlatformService);
    indexedDB = inject(IndexedDbService);
    http = inject(HttpClient);

    api: string = environment.api;
    apiKey: string = environment.apiKey;

    playerContent = signal<Assets | DesignLayout | Playlists | any>(null);
    playerCommand = signal<any>(null);
    playerBroadcast = signal<any>(null);
    isStartHealthCheck = signal<boolean>(false);

    systemInfo = signal<any>(null);
    playerCode = signal<string>('');

    androidData = signal<any>(null);
    dataFromAndroid = signal<any>(null);

    playerLoading = signal<boolean>(false);

    constructor() { }

    onLoadContents() { }

    async onSetContent(data: any) {
        const type = data.content.type;
        this.indexedDB.clearItems();
        if (!['facebook', 'youtube', 'link'].includes(type)) {
            const res = await fetch(data.content.url);
            const blob = await res.blob();
            await this.indexedDB.addItem({ ...data.content, url: blob });
        } else {
            await this.indexedDB.addItem(data.content);
        }
        this.playerContent.set(data);
    }
    
    sendDesktopCommand(action: string): Promise<any> {
        return new Promise((resolve, reject) => {
            window.system.control(action)
            .then(response => resolve(response))
            .catch(err => reject(err));
        });
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

    onConvertBlobToImage(blob: any, userId: any) {
        const deviceId = this.storage.get('deviceId');
        const tenantId = this.storage.get('tenantId');

        const newBlob = new Blob([blob], { type: 'image/png' });
        const file = new File([newBlob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
        
        const formData = new FormData();
        formData.append("file", file, file.name);
        

        const headers = new HttpHeaders({ 'x-tenant-id': tenantId, 'x-api-key': this.apiKey });
        this.http.post(`${this.api}tenants/screens/upload-screenshot/${deviceId}/${userId}`, formData, { headers }).subscribe(res => console.log(res));        
    }
    
    // onGetAndroidInformation(): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         (window as any).AndroidBridge = (window as any).AndroidBridge || {};

    //         // Android → JS callback
    //         (window as any).AndroidBridge.onDeviceDetails = (data: any) => {
    //             resolve(data);
    //             console.log('Received from android device details:', data);
    //         };

    //         // JS → Android request
    //         if (typeof (window as any).AndroidBridge.requestDeviceDetails === 'function') {
    //             (window as any).AndroidBridge.requestDeviceDetails();
    //         } else {
    //             console.warn('AndroidBridge.requestDeviceDetails not available yet');
    //         }

    //         // resolve();
    //     });
    // }
    onGetAndroidInformation(): Promise<any> {

        return new Promise((resolve) => {

            console.log("onGetAndroidInformation() started");

            // Make sure object exists (without killing native)
            if (!(window as any).AndroidBridge) {
                (window as any).AndroidBridge = {};
            }

            // Register Android → JS callback
            (window as any).AndroidBridge.onDeviceDetails = (data: any) => {

                console.log("Received from android:", data);

                resolve(data);
            };


            // Wait until Android method exists
            const waitForBridge = () => {

                if (typeof (window as any).AndroidBridge?.requestDeviceDetails === 'function') {

                    console.log("Calling requestDeviceDetails()");

                    (window as any).AndroidBridge.requestDeviceDetails();

                } else {

                    console.log("Waiting for AndroidBridge...");

                    setTimeout(waitForBridge, 300);
                }
            };

            // Start waiting
            waitForBridge();
        });
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

    onGetSystemHealthCheck() {
        // return this.http.get('http://localhost:8085/data.json')
        return new Promise((resolve, reject) => {
            window.system.getHealthCheck()
            .then((response: any) => {
                console.log(response);
                resolve(response);
            })
            .catch(err => {
                console.error('Error getting desktop system info:', err);
                reject(err);
            });
        });
    }
}
