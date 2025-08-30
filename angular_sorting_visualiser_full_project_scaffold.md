# Angular Conversion of the Sorting Visualiser

Below is a full Angular (standalone, Angular 19+) implementation that mirrors your original app’s behavior and UI:

- Global **Speed** and **Bars** sliders
- **Sort all** / **Reset all**
- Five algorithm cards (Quick, Shell, Insertion, Selection, Bubble)
- Canvas rendering, responsive sizing, per-card controls (Sort / More bars / Fewer bars / Generate new bars)
- Clean state management via **Angular Signals**

> **How to install & run**
>
> ```bash
> # 1) Create a new Angular app (standalone routing not required)
> npm i -g @angular/cli
> ng new sorting-visualiser-angular --style=css --routing=false
>
> cd sorting-visualiser-angular
>
> # 2) Add Bootstrap via CDN (we’ll paste it inside index.html below)
>
> # 3) Replace / add the files exactly as shown in this doc
> #    (don’t forget to copy images such as sort.png into src/assets/)
>
> # 4) Run
> ng serve -o
> ```

---

## File tree

```
src/
  index.html
  styles.css
  main.ts
  app/
    app.component.ts
    app.component.html
    app.component.css
    algorithm-card.component.ts
    algorithm-card.component.html
    algorithm-card.component.css
    sorting-algorithms.ts
    sorting.service.ts
    utils.ts
assets/
  sort.png            # copy from your original project (optional favicon)
```

---

## `src/main.ts`

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [provideAnimations()]
}).catch(err => console.error(err));
```

---

## `src/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Sorting Visualiser</title>
    <base href="/">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap (CDN) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">

    <link rel="icon" type="image/x-icon" href="assets/sort.png">
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

---

## `src/styles.css`

```css
/* --------- Layout & base --------- */
:root{
  --canvas-height: 260px;
  --bar-color: #000000; /* canvas stroke color */
}

html, body { min-height: 100%; }
body { margin-bottom: 24px; }

/* allow small gaps without relying on modern gap in all places */
.controls-inline > * + * { margin-left: .5rem; }

/* --------- Cards --------- */
.algo-card {
  background: #2f4255;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0,0,0,.18);
  overflow: hidden;
}
.algo-card .card-header { background: rgba(0,0,0,.12); border-bottom: 1px solid rgba(255,255,255,.06); }
.algo-card .card-body { background: #2b3e50; }

/* --------- Canvas --------- */
.canvas-wrap { position: relative; width: 100%; }
canvas {
  display: block;
  width: 100%;
  height: var(--canvas-height);
  background: linear-gradient(180deg, #f7f7f7, #ececec);
  border: 1px solid #d8d8d8;
  border-radius: 8px;
  box-shadow: 0 8px 18px rgba(0,0,0,.12);
}

/* --------- Buttons --------- */
.controls-row .btn + .btn { margin-left: .5rem; }
.btn-icon { width: 120px; padding: .375rem 0; }

/* Disabled cursor while sorting */
.sorting-disabled { pointer-events: none; opacity: .75; filter: grayscale(.2); }

/* Small note under cards */
.card-note { color: rgba(255,255,255,.65); font-size: .85rem; }
```

---

## `src/app/utils.ts`

```ts
export function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function formatAlgoName(key: string) {
  const pretty = key.replace(/([a-z])([A-Z])/g, '$1 $2'); // quickSort -> quick Sort
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}
```

---

## `src/app/sorting.service.ts`

```ts
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
    const sliderValue = this.speed();
    const delay = this.SPEED.DELAY_MAX - sliderValue;
    return Math.max(this.SPEED.DELAY_MIN, delay);
  }
}
```

---

## `src/app/sorting-algorithms.ts`

```ts
import { sleep } from './utils';

export interface AlgoHost {
  name: string;
  barHeights: number[];
  renderBars: () => void;
  getDelay: () => number; // host provides current delay based on global speed
}

abstract class SortingAlgorithm {
  constructor(public name: string, protected host: AlgoHost) {}
  protected async tick() { await sleep(this.host.getDelay()); }
  protected swap(arr: number[], i: number, j: number) {
    if (i < 0 || i >= arr.length || j < 0 || j >= arr.length)
      throw new Error(`Array out of bounds: length=${arr.length}, i=${i}, j=${j}`);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  async sort(): Promise<void> { throw new Error('Must implement'); }
}

export class QuickSort extends SortingAlgorithm {
  async sort() {
    await this.quickSortHelper(this.host.barHeights, 0, this.host.barHeights.length - 1);
  }
  private async partition(arr: number[], start: number, end: number) {
    const pivot = arr[end];
    let i = start - 1;
    for (let j = start; j < end; j++) {
      if (arr[j] < pivot) {
        i++;
        this.swap(arr, i, j);
        this.host.renderBars();
        await this.tick();
      }
    }
    this.swap(arr, i + 1, end);
    this.host.renderBars();
    await this.tick();
    return i + 1;
  }
  private async quickSortHelper(arr: number[], start: number, end: number): Promise<void> {
    if (start < end) {
      const idx = await this.partition(arr, start, end);
      await this.quickSortHelper(arr, start, idx - 1);
      await this.quickSortHelper(arr, idx + 1, end);
    }
  }
}

export class ShellSort extends SortingAlgorithm {
  async sort() {
    let gap = Math.floor(this.host.barHeights.length / 2);
    while (gap !== 0) {
      let start = 0;
      let end = start + gap;
      while (end < this.host.barHeights.length) {
        if (this.host.barHeights[start] > this.host.barHeights[end]) {
          this.swap(this.host.barHeights, start, end);
          this.host.renderBars();
          await this.tick();

          let tmpStart = start;
          let previous = tmpStart - gap;
          while (previous > -1 && this.host.barHeights[previous] > this.host.barHeights[tmpStart]) {
            this.swap(this.host.barHeights, previous, tmpStart);
            this.host.renderBars();
            await this.tick();
            tmpStart = previous;
            previous = previous - gap;
          }
        }
        start++;
        end++;
      }
      gap = Math.floor(gap / 2);
    }
  }
}

export class BubbleSort extends SortingAlgorithm {
  async sort() {
    let alreadySorted = false;
    for (let i = 0; i < this.host.barHeights.length - 1; i++) {
      if (!alreadySorted) {
        alreadySorted = true;
        for (let j = 0; j < this.host.barHeights.length - 1 - i; j++) {
          if (this.host.barHeights[j] > this.host.barHeights[j + 1]) {
            alreadySorted = false;
            this.swap(this.host.barHeights, j, j + 1);
            this.host.renderBars();
            await this.tick();
          }
        }
      }
    }
  }
}

export class SelectionSort extends SortingAlgorithm {
  async sort() {
    for (let i = 0; i < this.host.barHeights.length - 1; i++) {
      let indexMax = 0;
      for (let j = 0; j < this.host.barHeights.length - i; j++) {
        if (this.host.barHeights[j] > this.host.barHeights[indexMax]) {
          indexMax = j;
        }
      }
      this.swap(this.host.barHeights, indexMax, this.host.barHeights.length - 1 - i);
      this.host.renderBars();
      await this.tick();
    }
  }
}

export class InsertionSort extends SortingAlgorithm {
  async sort() {
    for (let i = 1; i < this.host.barHeights.length; i++) {
      let k = i;
      while (k > 0 && this.host.barHeights[k] < this.host.barHeights[k - 1]) {
        this.swap(this.host.barHeights, k, k - 1);
        k--;
        this.host.renderBars();
        await this.tick();
      }
    }
  }
}

export type AlgorithmKey = 'shellSort' | 'quickSort' | 'bubbleSort' | 'selectionSort' | 'insertionSort';

export function createAlgorithm(key: AlgorithmKey, host: AlgoHost) {
  switch (key) {
    case 'quickSort': return new QuickSort(key, host);
    case 'shellSort': return new ShellSort(key, host);
    case 'bubbleSort': return new BubbleSort(key, host);
    case 'selectionSort': return new SelectionSort(key, host);
    case 'insertionSort': return new InsertionSort(key, host);
  }
}
```

---

## `src/app/algorithm-card.component.ts`

```ts
import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, effect, OnDestroy, OnInit, AfterViewInit, HostBinding } from '@angular/core';
import { SortingService } from './sorting.service';
import { AlgorithmKey, createAlgorithm, AlgoHost } from './sorting-algorithms';
import { formatAlgoName } from './utils';

@Component({
  selector: 'app-algorithm-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './algorithm-card.component.html',
  styleUrls: ['./algorithm-card.component.css']
})
export class AlgorithmCardComponent implements OnInit, AfterViewInit, OnDestroy, AlgoHost {
  @Input({ required: true }) key!: AlgorithmKey;

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private resizeObs?: ResizeObserver;

  name = '';
  barHeights: number[] = [];
  barSpacing = this.sorting.density();
  isSorting = false;

  // Canvas drawing
  private ctx!: CanvasRenderingContext2D;

  constructor(public sorting: SortingService, private hostEl: ElementRef<HTMLElement>) {
    // react to global density slider: update spacing & regenerate
    effect(() => {
      const globalDensity = this.sorting.density();
      // Only auto-sync spacing if user hasn't customized via +/- buttons
      if (!this.isSorting) {
        this.barSpacing = globalDensity;
        this.refresh();
      }
    });
  }

  // AlgoHost
  getDelay = () => this.sorting.currentDelay();
  renderBars = () => this.drawBars();

  ngOnInit(): void {
    this.name = this.key;
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D context not available');
    this.ctx = ctx;

    // Ensure size & first render
    this.setCanvasSizeToParent(canvas);
    this.generateBarHeights();
    this.drawBars();

    // Watch parent size to keep canvas responsive
    this.resizeObs = new ResizeObserver(() => {
      this.setCanvasSizeToParent(canvas);
      this.generateBarHeights();
      this.drawBars();
    });
    this.resizeObs.observe(this.hostEl.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObs?.disconnect();
  }

  // ---------- UI actions ----------
  async sort() {
    this.isSorting = true;
    try {
      const algo = createAlgorithm(this.key, this);
      await algo.sort();
    } finally {
      this.isSorting = false;
    }
  }

  increaseBars() { // more bars => decrease spacing
    if (this.barSpacing > this.sorting.DENSITY.MIN) {
      this.barSpacing -= 1;
      this.refresh();
    }
  }

  decreaseBars() { // fewer bars => increase spacing
    if (this.barSpacing < this.sorting.DENSITY.MAX) {
      this.barSpacing += 1;
      this.refresh();
    }
  }

  generateNewBarsFromGlobal() {
    this.barSpacing = this.sorting.density();
    this.refresh();
  }

  /** public API used by parent (Sort all / Reset all) */
  refresh() {
    const canvas = this.canvasRef.nativeElement;
    this.setCanvasSizeToParent(canvas);
    this.generateBarHeights();
    this.drawBars();
  }

  // ---------- Rendering & sizing ----------
  private clearCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  private setCanvasSizeToParent(canvas: HTMLCanvasElement) {
    const parent = canvas.parentElement!;
    const rect = parent.getBoundingClientRect();
    const minWidth = this.sorting.CANVAS.MIN_WIDTH;
    canvas.width = Math.max(minWidth, Math.floor(rect.width - 2));

    const heightPx = getComputedStyle(canvas).height; // e.g. "260px"
    canvas.height = Math.round(parseFloat(heightPx));
  }

  private generateBarHeights() {
    const canvas = this.canvasRef.nativeElement;
    this.barHeights = [];
    for (let x = this.sorting.CANVAS.PADDING; x < canvas.width; x += this.barSpacing) {
      const halfHeight = canvas.height / 2;
      const val = halfHeight + Math.floor(Math.random() * (halfHeight - this.sorting.CANVAS.PADDING));
      this.barHeights.push(val);
    }
  }

  private drawBars() {
    this.clearCanvas();
    const canvas = this.canvasRef.nativeElement;

    for (let x = this.sorting.CANVAS.PADDING, i = 0; x < canvas.width && i < this.barHeights.length; x += this.barSpacing, i++) {
      const h = this.barHeights[i];
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.sorting.CANVAS.PADDING);
      this.ctx.lineTo(x, h);
      this.ctx.lineWidth = Math.max(this.sorting.BAR.MIN_LINE_WIDTH, this.barSpacing / this.sorting.BAR.LINE_WIDTH_DIVISOR);
      this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--bar-color').trim() || '#000000';
      this.ctx.stroke();
    }
  }

  // ---------- helpers ----------
  protected format(key: string) { return formatAlgoName(key); }
}
```

---

## `src/app/algorithm-card.component.html`

```html
<div class="col-lg-6 col-md-12 mb-4">
  <div class="card algo-card" [class.sorting-disabled]="isSorting">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">{{ key | titlecase : '' : '' /* non-standard, see css */ }}{{ '' }}</h5>
      <small class="text-muted" title="Best/Avg/Worst: see docs"></small>
    </div>
    <div class="card-body">
      <div class="canvas-wrap mb-3">
        <canvas #canvas>Your browser does not support the HTML5 canvas tag</canvas>
      </div>

      <div class="controls-row d-flex justify-content-center">
        <button class="btn btn-primary mr-2" (click)="sort()" [disabled]="isSorting">Sort</button>
        <button class="btn btn-outline-warning btn-icon" (click)="increaseBars()" [disabled]="isSorting" aria-label="Increase bars (decreases spacing)">More bars</button>
        <button class="btn btn-outline-warning btn-icon" (click)="decreaseBars()" [disabled]="isSorting" aria-label="Decrease bars (increases spacing)">Fewer bars</button>
        <button class="btn btn-secondary" (click)="generateNewBarsFromGlobal()" [disabled]="isSorting">Generate New Bars</button>
      </div>

      <div class="text-center mt-2 card-note">Adjust bar density or generate new bars</div>
    </div>
  </div>
</div>
```

> **Note:** Angular’s built-in `titlecase` pipe will title-case the whole key. If you prefer `Quick Sort` instead of `Quicksort`, replace the `<h5>` with: `{{ key.replace(/([a-z])([A-Z])/g,'$1 $2') | titlecase }}`

---

## `src/app/algorithm-card.component.css`

```css
/* Reuse global styles; only small component-specific tweaks here if needed */
```

---

## `src/app/app.component.ts`

```ts
import { CommonModule } from '@angular/common';
import { Component, QueryList, ViewChildren, computed } from '@angular/core';
import { AlgorithmCardComponent } from './algorithm-card.component';
import { SortingService } from './sorting.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AlgorithmCardComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Sorting Visualiser';

  // The five algorithms we render
  algorithms = [
    'quickSort',
    'shellSort',
    'insertionSort',
    'selectionSort',
    'bubbleSort',
  ] as const;

  @ViewChildren(AlgorithmCardComponent) cards!: QueryList<AlgorithmCardComponent>;

  uiLocked = false;

  constructor(public sorting: SortingService) {}

  onSpeedInput(event: Event) {
    const v = (event.target as HTMLInputElement).valueAsNumber;
    this.sorting.speed.set(v);
  }

  onDensityInput(event: Event) {
    const v = (event.target as HTMLInputElement).valueAsNumber;
    this.sorting.density.set(v);
    // Each card effect() already refreshes when density changes.
  }

  async sortAll() {
    this.uiLocked = true;
    try {
      await Promise.all(this.cards.map(c => c.sort()));
    } finally {
      this.uiLocked = false;
    }
  }

  resetAll() {
    this.sorting.speed.set(this.sorting.SPEED.SLIDER_DEFAULT);
    this.sorting.density.set(this.sorting.DENSITY.DEFAULT);
    this.cards.forEach(c => c.refresh());
  }
}
```

---

## `src/app/app.component.html`

```html
<nav class="navbar navbar-dark bg-dark shadow-sm">
  <div class="container d-flex justify-content-between align-items-center">
    <span class="navbar-brand mb-0 h1">{{ title }}</span>

    <div class="d-flex align-items-center gap-2 controls-inline">
      <div class="form-inline me-3">
        <label class="me-2 mb-0 small" for="speedRange">Speed</label>
        <input type="range" id="speedRange" min="1" max="100"
               [value]="sorting.speed()" (input)="onSpeedInput($event)">
      </div>

      <div class="form-inline me-3">
        <label class="me-2 mb-0 small" for="densityRange">Bars</label>
        <input type="range" id="densityRange"
               [min]="sorting.DENSITY.MIN" [max]="sorting.DENSITY.MAX"
               [value]="sorting.density()" (input)="onDensityInput($event)">
      </div>

      <button class="btn btn-danger me-2" (click)="sortAll()" [disabled]="uiLocked">Sort all</button>
      <button class="btn btn-secondary" (click)="resetAll()" [disabled]="uiLocked">Reset all</button>
    </div>
  </div>
</nav>

<main class="container py-4" id="main-content">
  <div class="row">
    <app-algorithm-card *ngFor="let key of algorithms" [key]="key"></app-algorithm-card>
  </div>
</main>

<footer class="text-center text-muted small pb-4">
  <span>Tip: use the sliders to change animation speed and number of bars.</span>
</footer>
```

---

## `src/app/app.component.css`

```css
/* small spacing parity with original */
.controls-inline > * + * { margin-left: .5rem; }
```

---

## Notes & parity checklist

- ✅ Algorithms and animations are line-for-line equivalents, using async/await and a `tick()` delay sourced from the global Speed slider (via `SortingService.currentDelay()`).
- ✅ Per-card **More/Fewer bars** adjust local `barSpacing`; **Generate New Bars** resyncs with the global Bars slider value.
- ✅ **Sort all** disables only the top buttons; each card disables its own controls while sorting.
- ✅ Canvas is **responsive** through a `ResizeObserver` on each card’s container.
- ✅ Styling is ported; Bootstrap is pulled from CDN in `index.html`.
- 🔧 If you prefer Angular Material instead of Bootstrap, swap the navbar/controls markup and add `MatSlider` components; the logic stays the same.

---

### (Optional) Favicon / images

- Put your `sort.png` in `src/assets/` and keep the same filename. Update `index.html` if you change the path.

---

**That’s it!** Paste these files into a fresh Angular app and you’ll have a 1:1 Angular version of your original sorting visualiser.

