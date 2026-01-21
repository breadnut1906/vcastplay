import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  isElectron = signal<boolean>(false);
  isAndroid = signal<boolean>(false);

  initializeApp(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        this.detectElectron();
        await this.detectAndroid().then(resolve);
      } catch (error) {
        reject(error);
      }
    })
  }

  private detectElectron() {
    this.isElectron.set(window.system?.isElectron);
  }

  private detectAndroid(): Promise<void> {
    return new Promise((resolve, reject) => {
      const check = () => {
        if ((window as any).isAndroid) {
          this.isAndroid.set(true);
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    })
  }

  get platform(): 'android' | 'desktop' | 'web' {
    if (this.isElectron()) {
      return 'desktop';
    } else if (this.isAndroid()) {
      return 'android';
    } else {
      return 'web';
    }
  }
}
