import { Component, computed, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

const TAB_ROUTES = ['/list', '/history'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styles: [`
    @keyframes nav-progress {
      0%   { width: 0%; opacity: 1; }
      80%  { width: 85%; opacity: 1; }
      100% { width: 95%; opacity: 1; }
    }
    .nav-bar { animation: nav-progress 8s cubic-bezier(0.1, 0.05, 0, 1) forwards; }
  `],
  template: `
    @if (navigating()) {
      <div class="fixed top-0 left-0 right-0 z-50" style="height: 3px; background: rgba(26,143,92,0.15); padding-top: env(safe-area-inset-top)">
        <div class="nav-bar h-full rounded-full" style="background: #1A8F5C; box-shadow: 0 0 8px rgba(26,143,92,0.5)"></div>
      </div>
    }
    <router-outlet />
    @if (showTabBar()) {
      <nav class="fixed bottom-0 left-0 right-0 z-30 flex bg-bg-app border-t"
           style="border-color: #ECE3D2; padding-bottom: env(safe-area-inset-bottom)">
        <a routerLink="/list" routerLinkActive #rl="routerLinkActive"
           class="flex-1 flex flex-col items-center py-[10px] gap-[3px]"
           [style.color]="rl.isActive ? '#1A8F5C' : '#A79C8A'">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 12h6M9 16h4"/>
          </svg>
          <span class="text-[11px] font-semibold">Ma liste</span>
        </a>
        <a routerLink="/history" routerLinkActive #rh="routerLinkActive"
           class="flex-1 flex flex-col items-center py-[10px] gap-[3px]"
           [style.color]="rh.isActive ? '#1A8F5C' : '#A79C8A'">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3.5 3.5"/>
          </svg>
          <span class="text-[11px] font-semibold">Historique</span>
        </a>
      </nav>
    }
  `,
})
export class App {
  private router = inject(Router);

  readonly navigating = signal(false);

  private readonly navEvents = toSignal(
    this.router.events.pipe(
      filter(e =>
        e instanceof NavigationStart ||
        e instanceof NavigationEnd ||
        e instanceof NavigationCancel ||
        e instanceof NavigationError
      ),
      map(e => {
        const loading = e instanceof NavigationStart;
        this.navigating.set(loading);
        return e;
      }),
    ),
  );

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly showTabBar = computed(() =>
    TAB_ROUTES.some(r => this.currentUrl().startsWith(r))
  );
}
