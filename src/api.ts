import type { VideoInfo, DownloadOptions } from './types';

const API_BASE = '/api';

/**
 * Fetch video info from a URL
 */
export async function fetchVideoInfo(url: string): Promise<VideoInfo> {
  const res = await fetch(`${API_BASE}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to fetch video info' }));
    throw new Error(error.message || 'Failed to fetch video info');
  }

  return res.json();
}

/**
 * Trigger a download — returns a blob download
 */
export async function downloadMedia(
  url: string,
  options: DownloadOptions,
  onProgress?: (progress: number) => void,
): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(`${API_BASE}/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, ...options }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Download failed' }));
    throw new Error(error.message || 'Download failed');
  }

  const filename = res.headers.get('X-Filename') || `novafetch_download.${options.type === 'audio' ? 'mp3' : options.format || 'mp4'}`;

  const contentLength = res.headers.get('Content-Length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (!res.body || total === 0) {
    const blob = await res.blob();
    onProgress?.(100);
    return { blob, filename };
  }

  const reader = res.body.getReader();
  const chunks: BlobPart[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total > 0) {
      onProgress?.(Math.round((received / total) * 100));
    }
  }

  const blob = new Blob(chunks);
  onProgress?.(100);
  return { blob, filename };
}

/**
 * Trigger file download in browser
 */
export function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
