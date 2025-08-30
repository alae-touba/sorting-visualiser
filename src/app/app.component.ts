import { CommonModule } from '@angular/common';
import { Component, QueryList, ViewChildren, computed } from '@angular/core';
import { AlgorithmCardComponent } from './algorithm-card.component';
import { SortingService } from './sorting.service';
import { AlgorithmKey } from './sorting-algorithms';

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
  algorithms: AlgorithmKey[] = [
    'quickSort',
    'shellSort',
    'insertionSort',
    'selectionSort',
    'bubbleSort',
  ];

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
