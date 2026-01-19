import { computed, inject, Injectable, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { User } from '../../../shared/interfaces/account-settings';
import { StorageService } from '../../../core/services/storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { Pagination } from '../../../shared/interfaces/general';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  storage = inject(StorageService);
  http = inject(HttpClient);
  api: string = environment.api

  constructor() { }

  onGetHTTPHeaders() {
    const tenantId = this.storage.get('id');
    const accessToken = `bearer ${this.storage.get('accessToken')}`;
    const headers = new HttpHeaders({ 'x-tenant-id': tenantId, 'Authorization': accessToken });
    return headers;
  }  

  onLoadUsers(page: number = 1, limit: number = 10) {
    return this.http.get(`${this.api}tenants/users?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() })
  }

  onSaveUser(id: number, item: User, mode: string = 'create') {
    if (mode == 'create') {
      return this.http.post(`${this.api}tenants/users`, item, { headers: this.onGetHTTPHeaders() });
    } else {
      return this.http.patch(`${this.api}tenants/users/${id}`, item, { headers: this.onGetHTTPHeaders() });
    }
  }

  onDeleteUser(user: User) {
    return this.http.delete(`${this.api}tenants/users/${user.id}`, { headers: this.onGetHTTPHeaders() });
  }
  
  forbiddenStartValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;
      if (!value) return null;
      const startsWithNumberOrSpecialChar = /^[0-9!@#$%^&*]/.test(value);
      return startsWithNumberOrSpecialChar ? { forbiddenStart: true } : null;
    };
  }

  passMatchValidator(control: AbstractControl): Validators | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmNewPassword')?.value;

    return password === confirmPassword ? null : { mismatch: true };
  }
}
