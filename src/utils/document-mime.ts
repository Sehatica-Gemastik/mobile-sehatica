export function resolveDocumentMime(name?: string | null, mimeType?: string | null): string {
  const raw = (mimeType ?? '').split(';')[0]?.trim().toLowerCase();
  if (raw && raw !== 'application/octet-stream') return raw;

  const lower = (name ?? '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic')) return 'image/heic';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';

  return raw || 'application/octet-stream';
}

export function isSupportedMedicalFileMime(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}
