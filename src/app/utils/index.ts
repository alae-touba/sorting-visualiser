export function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function formatAlgoName(key: string) {
  const pretty = key.replace(/([a-z])([A-Z])/g, '$1 $2'); // quickSort -> quick Sort
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}
