import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { StorageService } from '../../core/services/storage.service';
import { UtilityService } from '../../core/services/utility.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Screen } from '../../user/screens/screen';

@Injectable({
  providedIn: 'root'
})
export class ScreensService {
       
  api: string = environment.api;
  storage = inject(StorageService);
  utils = inject(UtilityService);
  http = inject(HttpClient);

  isEditMode = signal<boolean>(false);

  constructor() { }
  
  onGetHTTPHeaders() {
    const accessToken = `bearer ${this.storage.get('accessToken')}`;
    const headers = new HttpHeaders({ 'Authorization': accessToken });
    return headers;
  }  

  onGetScreens(page: number = 1, limit: number = 10) {
    return this.http.get<Screen[]>(`${this.api}/admin/screens?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() })
  }

  onDeleteScreen(id: number) {
    return this.http.delete(`${this.api}/admin/screens/${id}`, { headers: this.onGetHTTPHeaders() });
  }
}
