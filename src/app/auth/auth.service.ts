import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';

export interface User {
  id: number;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly user = signal<User | null>(null);

  me() {
    return this.http.get<User>('/api/auth/me').pipe(tap((u) => this.user.set(u)));
  }

  login(email: string, password: string) {
    return this.http.post<User>('/api/auth/login', { email, password }).pipe(tap((u) => this.user.set(u)));
  }

  register(email: string, password: string) {
    return this.http.post<User>('/api/auth/register', { email, password }).pipe(tap((u) => this.user.set(u)));
  }

  logout() {
    return this.http.post<void>('/api/auth/logout', {}).pipe(tap(() => this.user.set(null)));
  }
}
