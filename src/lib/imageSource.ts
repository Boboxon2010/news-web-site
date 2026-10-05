export function getSafeImageSource(source: unknown): string | null {
  return typeof source === 'string' && source.trim().length > 0 ? source : null;
}