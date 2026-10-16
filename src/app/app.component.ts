import { Component, afterNextRender, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { routes } from './app.routes';
import { AuthService } from './auth/auth.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, RouterLinkActive, HlmButtonImports],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'amundi2';
  readonly links = routes.filter((r) => r.data).map((r) => ({ path: r.path!, label: r.data!['label'] as string }));
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    // Restore the signed-in user (cookie) for the menu; a 401 just means signed out. Never runs during SSR.
    afterNextRender(() => this.auth.me().subscribe({ error: () => undefined }));
  }

  logout() {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/connexion'));
  }
}
