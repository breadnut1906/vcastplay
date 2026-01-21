import { inject } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { PlatformService } from "../services/platform.service";
import { StorageService } from "../services/storage.service";
import { UtilsService } from "../services/utils.service";
import { v7 as uuidv7 } from 'uuid';
import { PlayerService } from "../services/player.service";
import { MessageService } from "primeng/api";

// Initialization of the system
export function initializeApp() {
  return async () => {
    const appVersion = environment.version;
    const utils = inject(UtilsService);
    const storage = inject(StorageService);
    const platformService = inject(PlatformService);
    const playerService = inject(PlayerService);
    const message = inject(MessageService);

    // Initialize platform service (Detect electron(desktop) and android)
    platformService.initializeApp();
    const platform = platformService.platform;

    const uniqueId = uuidv7();
    const playerCode = utils.genereteScreenCode(6);

    try {
      // Generate player: unique code, player code, platform and app version
      if (!storage.hasKey('uniqueId')) {
        storage.set('uniqueId', uniqueId);
        storage.set('platform', platform);
        storage.set('code', playerCode);
        storage.set('appVersion', appVersion);

        const body = { uniqueId, code: playerCode, type: platform };
        
        switch (platform) {
          case 'android':
            playerService.onSendDataToAndroid(body);
            playerService.onGetAndroidInformation();
            console.log('Android Details:', playerService.androidData());
            const newResolution = playerService.androidData().resolution;
            const newOrientation = playerService.androidData().orientation;
            
            const androidInfo = playerService.androidData();
            
            Object.assign(body, { resolution: newResolution, orientation: newOrientation, info: androidInfo });
            break;
          case 'desktop':
            const [ playerInfo ]: any = await Promise.all([ playerService.onGetDesktopInformation() ]);
            const screen = playerInfo.screen;
            const resolution = `${screen.width}x${screen.height}`;
            const screenOrientation = screen.width >= screen.height ? 'landscape' : 'portrait';
            Object.assign(body, { resolution, orientation: screenOrientation, info: playerInfo });
            break;
        
          default:
            const { height, width, orientation, ...info } = playerService.onGetBrowserInformation();
            Object.assign(body, { resolution: `${width}x${height}`, orientation, info });
            break;
        }

        playerService.onRegisterPlayer(body).subscribe({
          next: (res) => console.log(`${platform} player installed successfully.`, res),
          error: (err) => {
            console.error(`Failed to install ${platform} player.`, JSON.stringify(err));
            message.add({ severity:'error', summary: 'Error', detail: `Failed to install ${platform} player.` });
          },
          complete: () => message.add({ severity:'success', summary: 'Success', detail: `${platform} player installed successfully.` })
        })
      }
    } catch (error) {
      console.error(error);
      message.add({ severity:'error', summary: 'Error', detail: `Failed to install ${platform} player.` });
    }
  }
}