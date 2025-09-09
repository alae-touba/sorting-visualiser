import { CommonModule } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { AlgorithmCardComponent } from '@components/algorithm-card/algorithm-card.component';
import { SortingService } from '@services/sorting.service';
import { AlgorithmKey } from '@algorithms';
import { HeaderComponent } from '@components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AlgorithmCardComponent, HeaderComponent],
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

  @ViewChildren(AlgorithmCardComponent) 
  algorithmCards!: QueryList<AlgorithmCardComponent>;

  uiLocked = false;

  constructor(public sorting: SortingService) {}

  onSpeedChange(speed: number): void {
    this.sorting.speed.set(speed);
  }

  onDensityChange(density: number): void {
    this.sorting.density.set(density);
  }

  async sortAll() {
    this.uiLocked = true;
    try {
      await Promise.all(this.algorithmCards.map(c => c.sort()));
    } finally {
      this.uiLocked = false;
    }
  }

  resetAll() {
    this.sorting.speed.set(this.sorting.SPEED.SLIDER_DEFAULT);
    this.sorting.density.set(this.sorting.DENSITY.DEFAULT);
    this.algorithmCards.forEach(c => c.refresh());
  }
}
