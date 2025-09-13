import { AlgorithmKey } from '@models';

export function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function formatAlgoName(key: AlgorithmKey) {
  const pretty = key.replace(/([a-z])([A-Z])/g, '$1 $2'); // quickSort -> quick Sort
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}

export function getCssVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}