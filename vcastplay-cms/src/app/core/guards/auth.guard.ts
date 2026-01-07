import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const storage = inject(StorageService);

  if (!auth.isAuthenticated()) return router.navigate(['/auth/login']);

  const requiredRoles = route.data?.['roles'] as string[] | undefined;


  if (requiredRoles?.length) {
    const user = JSON.parse(storage.get('admin')) ? 'ADMIN' : 'USER';

    if (!user || !requiredRoles.includes(user)) {
      return router.createUrlTree(['/']);
    }
  }

  return true;

  
};

export const authGuardChild: CanActivateChildFn = (route, state) => {
  return authGuard(route, state);
};