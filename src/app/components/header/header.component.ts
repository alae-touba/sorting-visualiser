import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input({ required: true })
  title!: string;

  @Input()
  uiLocked = false;

  @Input()
  speed!: number;

  @Input()
  density!: number;

  @Input()
  densityMin!: number;

  @Input()
  densityMax!: number;

  @Output()
  sortAllClicked = new EventEmitter<void>();

  @Output()
  resetAllClicked = new EventEmitter<void>();

  @Output()
  speedChanged = new EventEmitter<number>();

  @Output()
  densityChanged = new EventEmitter<number>();

  onSpeedInput(event: Event) {
    this.speedChanged.emit((event.target as HTMLInputElement).valueAsNumber);
  }

  onDensityInput(event: Event) {
    this.densityChanged.emit((event.target as HTMLInputElement).valueAsNumber);
  }

  sortAll() {
    this.sortAllClicked.emit();
  }

  resetAll() {
    this.resetAllClicked.emit();
  }
}