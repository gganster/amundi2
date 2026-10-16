import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

// Expired token on a protected call: forget the user and go back to the login page.
// /api/auth/* is excluded: a wrong password is a 401 the login form must show itself.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && !req.url.startsWith('/api/auth/')) {
        auth.user.set(null);
        router.navigateByUrl('/connexion');
      }
      return throwError(() => err);
    }),
  );
};
