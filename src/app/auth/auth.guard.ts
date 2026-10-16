import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

// Client-side guard only: the server renders the page without private data (it is loaded after hydration).
export const authGuard: CanActivateFn = () => {
  if (isPlatformServer(inject(PLATFORM_ID))) return true;
  const router = inject(Router);
  return inject(AuthService).me().pipe(
    map(() => true),
    catchError(() => of(router.parseUrl('/connexion'))),
  );
};
