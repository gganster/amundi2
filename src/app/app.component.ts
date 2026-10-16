import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { routes } from './app.routes';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, RouterLinkActive, HlmButtonImports],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'amundi2';
  readonly links = routes.filter((r) => r.data).map((r) => ({ path: r.path!, label: r.data!['label'] as string }));
}
