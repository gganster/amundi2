import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, HlmButtonImports],
  template: `
    <h1 class="mb-4 text-2xl font-bold">Connexion</h1>
    <form #f="ngForm" (ngSubmit)="submit()" class="flex max-w-sm flex-col gap-3">
      <label class="flex flex-col gap-1 text-sm">E-mail
        <input name="email" type="email" required autocomplete="email" [(ngModel)]="email" class="rounded-md border px-3 py-2" />
      </label>
      <label class="flex flex-col gap-1 text-sm">Mot de passe
        <input name="password" type="password" required autocomplete="current-password" [(ngModel)]="password" class="rounded-md border px-3 py-2" />
      </label>
      @if (error()) { <p role="alert" class="text-sm text-destructive">{{ error() }}</p> }
      <button hlmBtn type="submit" [disabled]="f.invalid || busy()">Se connecter</button>
      <p class="text-sm text-muted-foreground">Pas de compte ? <a routerLink="/inscription" class="underline">Créer un compte</a></p>
    </form>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  email = '';
  password = '';
  readonly error = signal('');
  readonly busy = signal(false);

  submit() {
    this.busy.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/portefeuille'),
      error: (e: HttpErrorResponse) => {
        this.busy.set(false);
        this.error.set(e.status === 401 ? 'E-mail ou mot de passe invalide.' : 'Connexion impossible, réessayez plus tard.');
      },
    });
  }
}
