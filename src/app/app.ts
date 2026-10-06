import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  template: `
    <header class="app-header">
      <div class="app-header-inner">
        <a class="app-brand" routerLink="/dashboard">Library</a>
        <nav class="app-nav" aria-label="Main navigation">
          <a
            class="app-nav-link"
            routerLink="/dashboard"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            >Home</a
          >
          <a
            class="app-nav-link"
            routerLink="/movies"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            >Movies</a
          >
        </nav>
      </div>
    </header>
    <main class="app-main"><router-outlet /></main>
  `,
})
export class App {}
