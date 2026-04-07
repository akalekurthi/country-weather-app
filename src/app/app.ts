import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly document = inject(DOCUMENT);

  protected readonly title = signal('Country & Weather');
  protected readonly darkMode = signal(false);
  protected readonly themeIcon = computed(() => (this.darkMode() ? 'dark_mode' : 'light_mode'));

  constructor() {
    effect(() => {
      const body = this.document.body;
      body.classList.toggle('theme-dark', this.darkMode());
    });
  }
}
