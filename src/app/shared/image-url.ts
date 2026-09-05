import { environment } from '../../environments/environment';

/**
 * Single shared image-URL helper used by ALL surfaces (cards, detail, OG)
 * so thumbnails never diverge. eApp blob variant prefixes: 4_ (400px), 12_ (1200px), 1_ (source).
 */
export type ImgSize = 'thumb' | 'card' | 'og';

const PREFIX: Record<ImgSize, string> = { thumb: '4_', card: '4_', og: '12_' };

export function imageUrl(filename: string | undefined | null, size: ImgSize = 'card'): string {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;
  return `${environment.blobImageBaseUrl}/${PREFIX[size]}${filename}`;
}
