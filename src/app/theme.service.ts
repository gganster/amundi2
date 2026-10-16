import { Injectable, signal } from '@angular/core';

// Light/dark theme: the `dark` class on <html> drives the CSS variables in styles.css.
// The initial class is set by the inline script of index.html (no flash); `init()` reads it back in the browser.
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(false);

  init() {
    this.dark.set(document.documentElement.classList.contains('dark'));
  }

  toggle() {
    const dark = !this.dark();
    this.dark.set(dark);
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      // Storage blocked (private mode): the theme just won't persist.
    }
  }
}
