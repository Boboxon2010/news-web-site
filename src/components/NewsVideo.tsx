'use client';

import { useState } from 'react';

interface NewsVideoProps {
    src: string;
    title: string;
    className?: string;
    detail?: boolean;
}

function getYouTubeVideoId(src: string): string | null {
    try {
        const url = new URL(src);
        if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null;
        if (url.hostname.endsWith('youtube.com')) {
            if (url.pathname === '/watch') return url.searchParams.get('v');
            if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || null;
            if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2] || null;
        }
    } catch {
        return null;
    }
    return null;
}

export default function NewsVideo({ src, title, className = '', detail = false }: NewsVideoProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const youtubeVideoId = getYouTubeVideoId(src);

    const updateProgress = (video: HTMLVideoElement) => {
        if (!video.duration || !video.buffered.length) return;
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setProgress(Math.min(100, Math.round((bufferedEnd / video.duration) * 100)));
    };

    return (
        <div className={`relative overflow-hidden bg-black ${detail ? 'aspect-video' : ''} ${className}`}>
            {youtubeVideoId ? (
                <iframe
                    src={`https://www.youtube.com/embed/${encodeURIComponent(youtubeVideoId)}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${encodeURIComponent(youtubeVideoId)}&controls=${detail ? 1 : 0}&rel=0`}
                    title={title}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen={detail}
                    onLoad={() => setIsLoading(false)}
                    className="h-full w-full border-0"
                />
            ) : (
                <video
                    src={src}
                    title={title}
                    autoPlay
                    muted={!detail}
                    controls={detail}
                    loop={!detail}
                    playsInline
                    preload={detail ? 'auto' : 'metadata'}
                    onLoadedMetadata={(event) => {
                        setIsLoading(false);
                        updateProgress(event.currentTarget);
                    }}
                    onCanPlay={() => setIsLoading(false)}
                    onWaiting={() => setIsLoading(true)}
                    onProgress={(event) => updateProgress(event.currentTarget)}
                    onClick={(event) => event.stopPropagation()}
                    className="h-full w-full object-cover"
                />
            )}
            {!detail && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-3 pt-8">
                    <span className="min-w-0 truncate text-xs font-bold text-white">{title}</span>
                    <span className="shrink-0 text-[10px] font-semibold text-white/80">Ovoz o‘chiq</span>
                </div>
            )}
            {isLoading && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 text-white">
                    <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-amber-400" />
                    <span className="text-xs font-semibold">Video yuklanmoqda... {progress}%</span>
                    <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/20">
                        <div className="h-full bg-amber-400 transition-all" style={{ width: `${Math.max(progress, 5)}%` }} />
                    </div>
                </div>
            )}
        </div>
    );
}
