import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, effect, OnDestroy, OnInit, AfterViewInit, HostBinding } from '@angular/core';
import { SortingService } from '@services/sorting.service';
import { createAlgorithm, AlgoHost } from '@algorithms';
import { AlgorithmKey } from '@models';

@Component({
  selector: 'app-algorithm-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './algorithm-card.component.html',
  styleUrls: ['./algorithm-card.component.css']
})
export class AlgorithmCardComponent implements OnInit, AfterViewInit, OnDestroy, AlgoHost {
  @HostBinding('class') 
  class = 'col-lg-6 col-md-12 mb-4';
  
  @Input({ required: true }) 
  algoKey!: AlgorithmKey;

  @ViewChild('canvas', { static: true }) 
  canvasRef!: ElementRef<HTMLCanvasElement>;
  
  // Canvas drawing
  private ctx!: CanvasRenderingContext2D;
  
  private resizeObs?: ResizeObserver;

  
  barHeights: number[] = [];
  barSpacing!: number;
  isSorting = false;

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

  ngOnInit(): void {
    this.barSpacing = this.sorting.density();
  }

  // AlgoHost
  getDelay = () => this.sorting.currentDelay();
  renderBars = () => this.drawBars();


  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D context not available');
    }
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
      const algo = createAlgorithm(this.algoKey, this);
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
    if (!this.ctx) { 
      return; 
    } // Guard against premature rendering
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

  
}
