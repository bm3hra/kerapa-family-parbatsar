/**
 * Utilities for client-side image compression (safe for Firestore document bounds),
 * video URL parsing (YouTube, Vimeo, Google Drive, direct MP4/WebM), and page slug generation.
 */

export async function compressImageToDataUrl(
  file: File,
  options?: { maxDim?: number; maxChars?: number },
): Promise<string> {
  const maxDim = options?.maxDim ?? 960;
  const maxChars = options?.maxChars ?? 180_000;

  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose a valid image file (JPG, PNG, or WebP).');
  }

  const bitmapUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Could not decode selected image.'));
      image.src = bitmapUrl;
    });

    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;
    if (width > maxDim || height > maxDim) {
      if (width >= height) {
        height = Math.max(1, Math.round((height * maxDim) / width));
        width = maxDim;
      } else {
        width = Math.max(1, Math.round((width * maxDim) / height));
        height = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas image processing is not supported in this browser.');

    let quality = 0.82;
    let scale = 1;
    let result = '';

    for (let attempt = 0; attempt < 6; attempt += 1) {
      canvas.width = Math.max(120, Math.round(width * scale));
      canvas.height = Math.max(120, Math.round(height * scale));
      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      result = canvas.toDataURL('image/jpeg', quality);
      if (result.length <= maxChars) {
        return result;
      }
      quality = Math.max(0.45, quality - 0.1);
      scale *= 0.82;
    }

    if (result.length > maxChars) {
      throw new Error('Image is still too large after compression. Please pick a smaller photo or paste an image URL.');
    }
    return result;
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}

export interface ParsedVideoSource {
  kind: 'youtube' | 'vimeo' | 'drive' | 'direct';
  embedUrl: string;
}

export function parseVideoSource(rawUrl: string): ParsedVideoSource {
  const url = (rawUrl || '').trim();
  if (!url) return { kind: 'direct', embedUrl: '' };

  // YouTube watch, share, shorts, or embed URLs
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytMatch?.[1]) {
    return {
      kind: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`,
    };
  }

  // Vimeo URLs
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch?.[1]) {
    return {
      kind: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // Google Drive shared video link
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch?.[1]) {
    return {
      kind: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
    };
  }

  return { kind: 'direct', embedUrl: url };
}

export function slugifyPageTitle(raw: string): string {
  const slug = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);
  return slug.length >= 2 ? slug : `page-${Date.now().toString(36)}`;
}
