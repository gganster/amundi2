import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, HlmButtonImports],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'amundi2';
}
