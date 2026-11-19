import { parseVideoSource } from '../lib/mediaUtils';

interface VideoPlayerProps {
  url: string;
  title: string;
  className?: string;
}

export function VideoPlayer({ url, title, className = '' }: VideoPlayerProps) {
  const source = parseVideoSource(url);

  if (!source.embedUrl) {
    return null;
  }

  if (source.kind === 'youtube' || source.kind === 'vimeo' || source.kind === 'drive') {
    return (
      <iframe
        src={source.embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className={`w-full h-full border-0 ${className}`}
      />
    );
  }

  return (
    <video
      controls
      preload="metadata"
      className={`w-full h-full ${className}`}
      src={source.embedUrl}
    />
  );
}
