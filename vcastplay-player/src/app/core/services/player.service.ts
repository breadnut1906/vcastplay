import { computed, inject, Injectable, signal } from '@angular/core';
import { Playlist, Playlists } from '../interfaces/playlist';
import { PlatformService } from './platform.service';
import { environment } from '../../../environments/environment.development';
import { Assets } from '../interfaces/assets';
import { DesignLayout } from '../interfaces/design-layout';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { IndexedDbService } from './indexed-db.service';
import { StorageService } from './storage.service';
import { UploadItem } from '../interfaces/player';
import { v7 as uuidv7 } from 'uuid';
import { WebsocketService } from './websocket.service';

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
    publicURL: string = environment.public;

    playerContent = signal<Assets | DesignLayout | Playlists | any>(null);
    // playerCommand = signal<any>(null);
    playerBroadcast = signal<any>(null);

    isStartHealthCheck = signal<boolean>(false);

    isUploading = signal<boolean>(false);
    uploadItems = signal<UploadItem[] | any[]>([]);

    // systemInfo = signal<any>(null);
    // playerCode = signal<string>('');

    // androidData = signal<any>(null);
    // dataFromAndroid = signal<any>(null);

    playerLoading = signal<boolean>(false);
    
    showBroadcastMessage = signal<boolean>(false);
    broadcastTimeout: any;

    constructor() { }

    onLoadContents() { }

    async onSetContent(data: any, socketClient?: any) {
        //Assets only: add playlist, design layout and schedule soon
        this.isUploading.set(true);
        this.indexedDB.clearItems();
        const { type, content } = data;
        this.storage.set('contentType', type);

        if (type == 'asset') {
            this.uploadItems.set([ { id: uuidv7(), content, process: 0, status: 'pending' }]);
            this.uploadItems().forEach((item) => this.onAddContent(data, item, socketClient));
            return;
        } else if (type == 'playlist') {
            const assets = content.entries.map((item: any) => ({
                id: item.id,
                content: {
                    ...item,
                    url: `${this.publicURL}assets/${this.tenantId}/${item.asset.name}`,
                },
                process: 0,
                staus: 'pending'
            }));            
            this.uploadItems.set(assets);
            this.uploadItems().forEach((item) => this.onAddContent(data, item, socketClient));
            return;
        } else {
            await this.indexedDB.addItem(data.content);
            this.playerContent.set(data);
        }

        // if (!['facebook', 'youtube', 'link'].includes(type)) {
        //     this.uploadItems.set([ {  id: uuidv7(), content: data, process: 0, status: 'pending' }]);
        //     this.uploadItems().forEach((item) => this.onAddContent(item, socketClient));
        // } 
    }

    onAddContent(data: any, item: UploadItem, socketClient?: any) {  
        const { url, name } = item.content
        
        item.status = 'uploading';
        socketClient.emit('response-update', { response: `Uploading Started...` })
        item.sub = this.http.get(url, { responseType: 'blob', reportProgress: true, observe: 'events' }).subscribe({
            next: (event: any) => {
                
                if (event.type == HttpEventType.DownloadProgress && event.total) {
                    item.progress = Math.round((event.loaded / event.total) * 100);
                    socketClient.emit('response-update', { response: `${item.progress}%` })
                }

                if (event.type == HttpEventType.Response) {
                    item.status = 'success';
                    item.progress = 100;                    
                    this.indexedDB.addItem({ ...item.content, url: event.body })
                    socketClient.emit('response-update', { response: `Upload completed` })
                }
            },
            error: (error: any) => {
                item.status = 'error';
                item.progress = 0;
                item.error = error;
                console.error(`Upload failed: ${name}`, error);
                this.indexedDB.addItem({ ...item.content, url: null })
                this.onCheckAllDone()
            },
            complete: () => this.onCheckAllDone(data)
        });
    }
    
    onCheckAllDone(data?: any) {
        const finished = this.uploadItems().every(i => i.status === 'success' || i.status === 'error' || i.status === 'cancel');
        if (finished) {
            if (data.type == 'playlist') {
                const { entries, ...playlist } = data.content;
                this.storage.set('playlist', JSON.stringify(playlist));
                this.playerContent.set(data);
                
            } else if (data.type == 'asset') {
                this.playerContent.set(data);
            }
            this.isUploading.set(false);
        }
    }

    onBroadcastMessage(data: any, socketClient?: any) {
        this.playerBroadcast.set(data);
        this.showBroadcastMessage.set(true);
        this.broadcastTimeout = setTimeout(() => {
            this.showBroadcastMessage.set(false)
            socketClient.emit('response-update', { response: `Broadcast completed` })
        }, data.duration * 1000);
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

    onRegisterPlayer(body: any) {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'x-api-key': this.apiKey });
        return this.http.post(`${this.api}admin/screens`, body, { headers });
    }
    
    /**
     * =======================================================================
     * Browser functions
     * =======================================================================
     */
    onGetBrowserInformation() {
        const { appVersion, appName, platform, userAgent }: any = navigator;
        const height = screen.height;
        const width = screen.width;
        const orientation = height < width ? 'landscape' : 'portrait';
        return { appVersion, appName, platform, userAgent, height, width, orientation };
    }

    /**
     * =======================================================================
     * Desktop functions
     * =======================================================================
     */
    onSendDataToDesktop(data: any) {
        window.system.onSendContentLogs(JSON.stringify(data));
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

    onGetSystemHealthCheck() {
        return new Promise((resolve, reject) => {
            window.system.getHealthCheck()
            .then((response: any) => {
                resolve(response);
            })
            .catch(err => {
                console.error('Error getting desktop system info:', err);
                reject(err);
            });
        });
    }

    /**
     * =======================================================================
     * Android functions
     * =======================================================================
     */
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

    onSendDataToAndroid(data: any) {
        if ((window as any).AndroidBridge && typeof (window as any).AndroidBridge.sendCommand === 'function') {
            const jsonData = JSON.stringify(data);
            console.log(jsonData);
            (window as any).AndroidBridge.sendCommand(jsonData);
        } else {
            console.warn('AndroidBridge not available.');
        }
    }

    get tenantId() { return this.storage.get('tenantId'); }
}
