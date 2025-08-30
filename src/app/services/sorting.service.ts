import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SortingService {
  // Global sliders (signals)
  speed = signal<number>(40);   // 1..100
  density = signal<number>(8);  // 3..30

  // Mirror your original config constants
  readonly SPEED = {
    SLIDER_DEFAULT: 40,
    DEFAULT_DELAY_MS: 80,
    DELAY_MIN: 20,
    DELAY_MAX: 120
  } as const;

  readonly DENSITY = {
    MIN: 3,
    MAX: 30,
    DEFAULT: 8
  } as const;

  readonly CANVAS = {
    MIN_WIDTH: 300,
    PADDING: 2,
    RESIZE_DEBOUNCE: 120
  } as const;

  readonly BAR = {
    MIN_LINE_WIDTH: 1,
    LINE_WIDTH_DIVISOR: 4
  } as const;

  currentDelay(): number {
    return this.SPEED.DELAY_MAX - this.speed();
  }
}
