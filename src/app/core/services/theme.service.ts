import { Injectable, signal } from '@angular/core';

export type TransitionVariant =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'diamond'
  | 'hexagon'
  | 'rectangle'
  | 'star';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private isInitialized = false;
  
  // Reactively track whether dark mode is currently active
  public isDarkMode = signal<boolean>(false);
  private currentThemeMode = signal<string>('dark'); // 'dark' | 'light' | 'system'

  constructor() {
    this.loadInitialTheme();
    
    // Dynamically respond to system OS theme changes if user chose 'system' preference
    this.mediaQuery.addEventListener('change', () => {
      if (this.currentThemeMode() === 'system') {
        const targetDark = this.mediaQuery.matches;
        if (this.isDarkMode() !== targetDark) {
          this.runThemeTransition(targetDark);
        }
      }
    });
  }

  private loadInitialTheme() {
    const savedPrefs = localStorage.getItem('premium_account_prefs');
    let themePreference = 'dark'; // default
    
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.themeMode) {
          themePreference = parsed.themeMode.toLowerCase();
        }
      } catch (e) {}
    } else {
      const legacyTheme = localStorage.getItem('theme');
      if (legacyTheme) {
        themePreference = legacyTheme.toLowerCase();
      }
    }

    const normalizedMode = themePreference.toLowerCase();
    this.currentThemeMode.set(normalizedMode);

    let targetDark = false;
    if (normalizedMode === 'dark') {
      targetDark = true;
    } else if (normalizedMode === 'light') {
      targetDark = false;
    } else if (normalizedMode === 'system') {
      targetDark = this.mediaQuery.matches;
    }

    this.applyTheme(targetDark);
    this.isInitialized = true;
  }

  public setThemeMode(
    mode: string,
    event?: MouseEvent,
    variant: TransitionVariant = 'circle',
    duration: number = 400
  ) {
    const normalizedMode = mode.toLowerCase();
    this.currentThemeMode.set(normalizedMode);

    let targetDark = false;
    if (normalizedMode === 'dark') {
      targetDark = true;
    } else if (normalizedMode === 'light') {
      targetDark = false;
    } else if (normalizedMode === 'system') {
      targetDark = this.mediaQuery.matches;
    }

    const currentDark = this.isDarkMode();

    if (normalizedMode === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', normalizedMode);
    }

    if (this.isInitialized && targetDark !== currentDark) {
      this.runThemeTransition(targetDark, event, variant, duration);
    } else {
      this.applyTheme(targetDark);
    }
  }

  public getThemeMode(): string {
    return this.currentThemeMode();
  }

  public toggleTheme(
    event?: MouseEvent,
    variant: TransitionVariant = 'circle',
    duration: number = 450
  ) {
    const nextDark = !this.isDarkMode();
    this.setThemeMode(nextDark ? 'dark' : 'light', event, variant, duration);
    
    // Sync the premium account preference object in localStorage
    const savedPrefs = localStorage.getItem('premium_account_prefs');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        parsed.themeMode = nextDark ? 'Dark' : 'Light';
        localStorage.setItem('premium_account_prefs', JSON.stringify(parsed));
      } catch (e) {}
    }
  }

  private applyTheme(dark: boolean) {
    this.isDarkMode.set(dark);
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  private runThemeTransition(
    targetDark: boolean,
    event?: MouseEvent,
    variant: TransitionVariant = 'circle',
    duration: number = 400
  ) {
    if (typeof (document as any).startViewTransition !== 'function') {
      this.applyTheme(targetDark);
      return;
    }

    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

    let x: number;
    let y: number;

    if (event) {
      x = event.clientX;
      y = event.clientY;
    } else {
      x = viewportWidth / 2;
      y = viewportHeight / 2;
    }

    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    );

    const clipPath = this.getThemeTransitionClipPaths(
      variant,
      x,
      y,
      maxRadius,
      viewportWidth,
      viewportHeight
    );

    const root = document.documentElement;
    root.setAttribute('data-magicui-theme-vt', 'active');
    root.style.setProperty('--magicui-theme-toggle-vt-duration', `${duration}ms`);
    root.style.setProperty('--magicui-theme-vt-clip-from', clipPath[0]);

    const cleanup = () => {
      root.removeAttribute('data-magicui-theme-vt');
      root.style.removeProperty('--magicui-theme-toggle-vt-duration');
      root.style.removeProperty('--magicui-theme-vt-clip-from');
    };

    const transition = (document as any).startViewTransition(() => {
      this.applyTheme(targetDark);
    });

    if (transition && typeof transition.finished?.finally === 'function') {
      transition.finished.finally(cleanup);
    } else {
      cleanup();
    }

    const ready = transition?.ready;
    if (ready && typeof ready.then === 'function') {
      ready.then(() => {
        document.documentElement.animate(
          {
            clipPath,
          },
          {
            duration,
            easing: variant === 'star' ? 'linear' : 'ease-in-out',
            fill: 'forwards',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    }
  }

  private polygonCollapsed(cx: number, cy: number, vertexCount: number): string {
    const pairs = Array.from(
      { length: vertexCount },
      () => `${cx}px ${cy}px`
    ).join(', ');
    return `polygon(${pairs})`;
  }

  private getThemeTransitionClipPaths(
    variant: TransitionVariant,
    cx: number,
    cy: number,
    maxRadius: number,
    viewportWidth: number,
    viewportHeight: number
  ): [string, string] {
    switch (variant) {
      case 'circle':
        return [
          `circle(0px at ${cx}px ${cy}px)`,
          `circle(${maxRadius}px at ${cx}px ${cy}px)`,
        ];
      case 'square': {
        const halfW = Math.max(cx, viewportWidth - cx);
        const halfH = Math.max(cy, viewportHeight - cy);
        const halfSide = Math.max(halfW, halfH) * 1.05;
        const end = [
          `${cx - halfSide}px ${cy - halfSide}px`,
          `${cx + halfSide}px ${cy - halfSide}px`,
          `${cx + halfSide}px ${cy + halfSide}px`,
          `${cx - halfSide}px ${cy + halfSide}px`,
        ].join(', ');
        return [this.polygonCollapsed(cx, cy, 4), `polygon(${end})`];
      }
      case 'triangle': {
        const scale = maxRadius * 2.2;
        const dx = (Math.sqrt(3) / 2) * scale;
        const verts = [
          `${cx}px ${cy - scale}px`,
          `${cx + dx}px ${cy + 0.5 * scale}px`,
          `${cx - dx}px ${cy + 0.5 * scale}px`,
        ].join(', ');
        return [this.polygonCollapsed(cx, cy, 3), `polygon(${verts})`];
      }
      case 'diamond': {
        const R = maxRadius * Math.SQRT2;
        const end = [
          `${cx}px ${cy - R}px`,
          `${cx + R}px ${cy}px`,
          `${cx}px ${cy + R}px`,
          `${cx - R}px ${cy}px`,
        ].join(', ');
        return [this.polygonCollapsed(cx, cy, 4), `polygon(${end})`];
      }
      case 'hexagon': {
        const R = maxRadius * Math.SQRT2;
        const verts: string[] = [];
        for (let i = 0; i < 6; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 3;
          verts.push(`${cx + R * Math.cos(a)}px ${cy + R * Math.sin(a)}px`);
        }
        return [this.polygonCollapsed(cx, cy, 6), `polygon(${verts.join(', ')})`];
      }
      case 'rectangle': {
        const halfW = Math.max(cx, viewportWidth - cx);
        const halfH = Math.max(cy, viewportHeight - cy);
        const end = [
          `${cx - halfW}px ${cy - halfH}px`,
          `${cx + halfW}px ${cy - halfH}px`,
          `${cx + halfW}px ${cy + halfH}px`,
          `${cx - halfW}px ${cy + halfH}px`,
        ].join(', ');
        return [this.polygonCollapsed(cx, cy, 4), `polygon(${end})`];
      }
      case 'star': {
        const R = maxRadius * Math.SQRT2 * 1.03;
        const innerRatio = 0.42;
        const starPolygon = (radius: number) => {
          const verts: string[] = [];
          for (let i = 0; i < 5; i++) {
            const outerA = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
            verts.push(
              `${cx + radius * Math.cos(outerA)}px ${cy + radius * Math.sin(outerA)}px`
            );
            const innerA = outerA + Math.PI / 5;
            verts.push(
              `${cx + radius * innerRatio * Math.cos(innerA)}px ${cy + radius * innerRatio * Math.sin(innerA)}px`
            );
          }
          return `polygon(${verts.join(', ')})`;
        };
        const startR = Math.max(2, R * 0.025);
        return [starPolygon(startR), starPolygon(R)];
      }
      default:
        return [
          `circle(0px at ${cx}px ${cy}px)`,
          `circle(${maxRadius}px at ${cx}px ${cy}px)`,
        ];
    }
  }
}
