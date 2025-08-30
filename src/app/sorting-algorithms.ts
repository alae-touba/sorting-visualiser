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
  override async sort() {
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
  override async sort() {
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
  override async sort() {
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
  override async sort() {
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
  override async sort() {
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
