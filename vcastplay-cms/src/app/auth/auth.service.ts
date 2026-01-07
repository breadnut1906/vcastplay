import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../core/services/storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  storage = inject(StorageService);
  router = inject(Router);
  http = inject(HttpClient);

  api: string = environment.api;

  constructor() { }

  isAuthenticated(): boolean {
    return !!this.onGetToken();
  }

  onLogin(body: any, tenantId: string) {
    const headers = new HttpHeaders({ 'x-tenant-id': tenantId });
    const newApi = tenantId ? `${this.api}tenants/auth/login` : `${this.api}admin/auth/login`;
    
    if (!tenantId) return this.http.post(newApi, body);
    else return this.http.post(newApi, body, { headers });
  }

  onLogout() {
    const id = this.storage.get('id');
    
    this.storage.remove('accessToken');
    this.storage.remove('refreshToken');

    return Promise.resolve(id);
  }

  onGetToken() {
    return this.storage.get('accessToken');
  }
}
