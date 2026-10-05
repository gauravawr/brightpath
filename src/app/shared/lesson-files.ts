import { environment } from '../../environments/environment';

/** Resolve a lesson asset; application routes must not use this helper. */
export function lessonFileUrl(path: string): string {
  const relative = path.replace(/^\/?lessons\//, '').replace(/^\/+/, '');
  if (relative.split('/').some(part => part === '..')) throw new Error('Invalid lesson path');
  const version = /^year-5-maths\//.test(relative)
    ? '?v=20260929-year5-complete'
    : /^year-4-maths\//.test(relative)
    ? '?v=20260924-year4-complete'
    : /^year-3-maths\//.test(relative)
    ? '?v=20261003-lines-shapes-fix'
    : /^year-[12]-maths\//.test(relative)
      ? '?v=20260918-reviewed'
      : '';
  return `${environment.blobContentBaseUrl}/lessons/${relative.split('/').map(encodeURIComponent).join('/')}${version}`;
}

/** Open a public PowerPoint in Microsoft PowerPoint for the web, preserving native slide animations. */
export function powerPointViewerUrl(powerPointUrl: string): string {
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(powerPointUrl)}`;
}

/** Cross-origin download attributes are ignored by browsers; download a fetched blob. */
export async function downloadFile(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed (${response.status})`);
    const objectUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = decodeURIComponent(new URL(url).pathname.split('/').pop() || 'lesson');
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  } catch {
    alert('The file could not be downloaded. Please try again shortly.');
  }
}
