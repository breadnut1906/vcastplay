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
    let body: any;
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
          console.log(playerService.androidData());
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
        next: (res) => {
          console.log('Player registered successfully:', res);
        },
        error: (err) => {
          console.error('Error registering player:', err);
          message.add({ severity:'error', summary: 'Error', detail: 'Failed to register desktop player.' });
        },
        complete: () => {
          message.add({ severity:'success', summary: 'Success', detail: 'Desktop player registered successfully.' });
        }
      })
    }
  }
}