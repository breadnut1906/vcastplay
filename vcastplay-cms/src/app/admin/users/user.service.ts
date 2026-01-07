import { inject, Injectable } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  storage = inject(StorageService);
  http = inject(HttpClient);
  api: string = environment.api

  constructor() { }
  
  onGetHTTPHeaders() {
    const accessToken = `bearer ${this.storage.get('accessToken')}`;
    const headers = new HttpHeaders({ 'Authorization': accessToken });
    return headers;
  }  

  onGetUsers(page: number = 1, limit: number = 10) {
    return this.http.get(`${this.api}/admin/users?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() });
  }
}
