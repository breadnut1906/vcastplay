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

  private usersCache = new Map<string, any>();
  users = signal<User[]>([]);
  paginatedUsers = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  userLoading = signal<boolean>(false);
  showDialog = signal<boolean>(false);
  isEdit = signal<boolean>(false);

  userForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    // code: new FormControl(''),
    firstName: new FormControl('', [ Validators.required ]),
    middleName: new FormControl(''),
    lastName: new FormControl('', [ Validators.required ]),
    email: new FormControl('', [ Validators.required, Validators.email ]),
    password: new FormControl('', [ Validators.required ]),
    mobileNo: new FormControl('', [ Validators.required ]),
    // role: new FormControl('', [ Validators.required ]),
    // status: new FormControl(''),
    // expiredAt: new FormControl(''),
  })  

  securityForm: FormGroup = new FormGroup({
    password: new FormControl('', [ Validators.required ]),
    newPassword: new FormControl(null, [ 
      Validators.required, 
      Validators.minLength(6), 
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/),
      this.forbiddenStartValidator() 
    ]),
    confirmNewPassword: new FormControl(null, [ Validators.required ])
  }, { validators: this.passMatchValidator });

  constructor() { }

  onGetHTTPHeaders() {
    const tenantId = this.storage.get('id');
    const accessToken = `bearer ${this.storage.get('accessToken')}`;
    const headers = new HttpHeaders({ 'x-tenant-id': tenantId, 'Authorization': accessToken });
    return headers;
  }  

  onLoadUsers(page: number = 1, limit: number = 10) {
    const key = `${page}-${limit}`

    this.users.set([]);
    this.userLoading.set(true);

    if (this.usersCache.has(key)) {
      const cached = this.usersCache.get(key);
      this.users.set(cached);
      this.userLoading.set(false);
      return
    }

    this.http.get(`${this.api}tenants/users?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() }).subscribe({
      next: (response: any) => {
        this.usersCache.set(key, response);
        this.users.set(response);
        // this.paginatedUsers.set(response.meta);
      },
      error: (error: any) => {
        console.log(error);
      },
      complete: () => {
        this.userLoading.set(false);
      }
    })
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
