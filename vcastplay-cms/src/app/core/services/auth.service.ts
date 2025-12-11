import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

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
    return this.http.post(`${this.api}tenants/auth/login`, body, { headers })
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
