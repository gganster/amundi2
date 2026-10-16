import { HttpErrorResponse } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

// Client-side guard only: the server renders the page without private data (it is loaded after hydration).
// Only 401/403 send the visitor to the login page; any other failure (500, network) lets the page load and report its own error.
export const authGuard: CanActivateFn = () => {
  if (isPlatformServer(inject(PLATFORM_ID))) return true;
  const auth = inject(AuthService);
  if (auth.user()) return true;
  const router = inject(Router);
  return auth.me().pipe(
    map(() => true),
    catchError((err: HttpErrorResponse) => of(err.status === 401 || err.status === 403 ? router.parseUrl('/connexion') : true)),
  );
};
