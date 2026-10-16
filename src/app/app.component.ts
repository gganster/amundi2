import { Component, afterNextRender, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './auth/auth.service';
import { ThemeService } from './theme.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'amundi2';
  readonly links = routes.filter((r) => r.data).map((r) => ({ path: r.path!, label: r.data!['label'] as string }));
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly sunIcon = 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4';
  readonly moonIcon = 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z';
  private readonly router = inject(Router);

  constructor() {
    // Restore the signed-in user (cookie) for the menu unless the route guard already did; a 401 just means signed out.
    // Never runs during SSR.
    afterNextRender(() => {
      this.theme.init();
      if (!this.auth.user()) this.auth.me().subscribe({ error: () => undefined });
    });
  }

  readonly logoutFailed = signal(false);

  logout() {
    this.logoutFailed.set(false);
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/connexion'),
      error: () => this.logoutFailed.set(true),
    });
  }
}
