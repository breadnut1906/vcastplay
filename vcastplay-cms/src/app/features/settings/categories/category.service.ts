import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../../core/services/storage.service';
import { Pagination } from '../../../core/interfaces/general';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  api: string = environment.api;
  storage = inject(StorageService);
  http = inject(HttpClient);

  private categoryCache = new Map<string, any>();
  categories = signal<any[]>([]);
  paginatedCategories = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  categoryLoading = signal<boolean>(false);

  private subCategoryCache = new Map<string, any>();
  subCategories = signal<any[]>([]);
  paginatedSubCategories = signal<Pagination>({ currentPage: 1, itemCount: 0, itemsPerPage: 10, totalItems: 0, totalPages: 0 });
  subCategoryLoading = signal<boolean>(false);

  constructor() { }

  onGetHTTPHeaders() {
    const tenantId = this.storage.get('id');
    const accessToken = `Bearer ${this.storage.get('accessToken')}`;
    const headers = new HttpHeaders({ 'x-tenant-id': tenantId, 'Authorization': accessToken });
    return headers;
  }  

  onLoadCategories(page: number = 1, limit: number = 10) {
    const key = `${page}-${limit}`;

    this.subCategories.set([]);
    this.categoryLoading.set(true);

    if (this.categoryCache.has(key)) {
      const cached = this.categoryCache.get(key);
      this.categories.set(cached.items);
      this.paginatedCategories.set(cached.meta);
      return
    }

    this.http.get(`${this.api}tenants/categories?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() }).subscribe({
      next: (response: any) => {
        this.categoryCache.set(key, response);
        this.categories.set(response.items);
        this.paginatedCategories.set(response.meta);
      },
      error: (error: any) => {
        console.log(error);
      },
      complete: () => {
        this.categoryLoading.set(false);
      }
    })
  }

  onLoadSubCategoriesById(id: number, page: number = 1, limit: number = 10) {
    const key = `${id}-${page}-${limit}`;

    this.subCategoryLoading.set(true);

    if (this.subCategoryCache.has(key)) {
      const cached = this.subCategoryCache.get(key);
      this.subCategories.set(cached.items);
      this.paginatedSubCategories.set(cached.meta);
      return
    }

    this.http.get(`${this.api}tenants/categories/${id}/sub-categories?page=${page}&limit=${limit}`, { headers: this.onGetHTTPHeaders() }).subscribe({
      next: (response: any) => {
        this.subCategoryCache.set(key, response);
        this.subCategories.set(response.items);
        this.paginatedSubCategories.set(response.meta);
      },
      error: (error: any) => {
        console.log(error);
      },
      complete: () => {
        this.subCategoryLoading.set(false);
      }
    })
  }
  
  onSaveCategories(categoryId: number,item: any, mode: string = 'create') {
    if (mode == 'create') {
      return this.http.post(`${this.api}tenants/categories`, item, { headers: this.onGetHTTPHeaders() });
    } else {
      return this.http.patch(`${this.api}tenants/categories/${categoryId}`, item, { headers: this.onGetHTTPHeaders() });
    }
  }

  onSaveSubCategories(categoryId: number, subCategoryId: number, item: any, mode: string = 'create') {
    if (mode == 'create') {
      return this.http.post(`${this.api}tenants/categories/${categoryId}/sub-categories`, item, { headers: this.onGetHTTPHeaders() });
    } else {
      return this.http.patch(`${this.api}tenants/categories/${categoryId}/sub-categories/${subCategoryId}`, item, { headers: this.onGetHTTPHeaders() });
    }
  }

  onDeleteCategories(id: number) {
    return this.http.delete(`${this.api}tenants/categories/${id}`, { headers: this.onGetHTTPHeaders() });
  }
  
  onDeleteSubCategories(categoryId: number, subCategoryId: number) {
    return this.http.delete(`${this.api}tenants/categories/${categoryId}/sub-categories/${subCategoryId}`, { headers: this.onGetHTTPHeaders() });
  }
}
