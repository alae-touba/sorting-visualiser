import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortingService } from '../sorting.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() uiLocked = false;
  @Output() sortAllClicked = new EventEmitter<void>();
  @Output() resetAllClicked = new EventEmitter<void>();

  constructor(public sorting: SortingService) {}

  onSpeedInput(event: Event) {
    const v = (event.target as HTMLInputElement).valueAsNumber;
    this.sorting.speed.set(v);
  }

  onDensityInput(event: Event) {
    const v = (event.target as HTMLInputElement).valueAsNumber;
    this.sorting.density.set(v);
  }

  sortAll() {
    this.sortAllClicked.emit();
  }

  resetAll() {
    this.resetAllClicked.emit();
  }
}