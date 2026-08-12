/** Android butuh URI absolut (file://). Path mentah sering tanpa scheme. */
export function toAbsoluteFileUri(uriOrPath: string): string {
  const trimmed = uriOrPath.trim();
  if (!trimmed) {
    throw new Error('Path file tidak valid.');
  }
  if (trimmed.startsWith('file://') || trimmed.startsWith('content://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return `file://${trimmed}`;
  }
  throw new Error('Path file tidak valid.');
}
