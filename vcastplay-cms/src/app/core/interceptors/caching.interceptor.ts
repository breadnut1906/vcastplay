import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { CachingService } from '../services/caching.service';
import { NavigationEnd, Router } from '@angular/router';
import { catchError, of, tap, throwError } from 'rxjs';

export const cachingInterceptor: HttpInterceptorFn = (req, next) => {

  const storage = inject(StorageService);
  const cacheService = inject(CachingService);
  const router = inject(Router);

  const token = storage.get('accessToken');
  const tenantId = storage.get('id');

  let authReq = req;
  if (tenantId) authReq = req.clone({ setHeaders: { Authorization: `bearer ${token}`, 'x-tenant-id': tenantId } });

  // Clear cache when logged out
  router.events.subscribe(event => {
    if (event instanceof NavigationEnd && event.urlAfterRedirects == '/login') cacheService.clear();
  })

  if (req.method !== 'GET') {
    // Clear cache on non-GET requests
    cacheService.clear();
    return next(authReq);
  }

  const cachedResponse = cacheService.get(req.url);
  if (cachedResponse) return of(cachedResponse.clone());

  return next(authReq).pipe(tap(event => {
    if (event instanceof HttpResponse) cacheService.put(req.url, event);
    }),
    catchError(err => {
      return throwError(() => err)
    })
  );
};
