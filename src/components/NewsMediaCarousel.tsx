'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import NewsVideo from '@/components/NewsVideo';
import { getSafeImageSource } from '@/lib/imageSource';
import type { NewsFile } from '@/lib/dataStore';

interface NewsMediaCarouselProps {
    images?: string[];
    videos?: NewsFile[];
    title: string;
    onOpenNews?: () => void;
    className?: string;
}

type MediaItem = { kind: 'video'; src: string; id: string } | { kind: 'image'; src: string; id: string };

export default function NewsMediaCarousel({ images = [], videos = [], title, onOpenNews, className = '' }: NewsMediaCarouselProps) {
    const media: MediaItem[] = [
        ...videos.filter((video) => video.dataUrl).map((video) => ({ kind: 'video' as const, src: video.dataUrl, id: video.id })),
        ...images.filter((image) => getSafeImageSource(image)).map((image, index) => ({ kind: 'image' as const, src: image, id: `${image}-${index}` })),
    ];
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStartX = useRef<number | null>(null);
    const lastSwipeAt = useRef(0);

    if (media.length === 0) return null;

    const move = (direction: -1 | 1) => {
        setCurrentIndex((index) => (index + direction + media.length) % media.length);
    };

    const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current === null) return;
        const distance = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(distance) < 40) return;
        lastSwipeAt.current = Date.now();
        move(distance < 0 ? 1 : -1);
    };

    const current = media[currentIndex];

    return (
        <div
            className={`group/media relative mb-4 h-48 w-full touch-pan-y overflow-hidden rounded-xl bg-slate-950 ${className}`}
            onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
            onTouchEnd={handleTouchEnd}
        >
            <button
                type="button"
                aria-label={`Yangilikni to‘liq ochish: ${title}`}
                onClick={() => {
                    if (Date.now() - lastSwipeAt.current < 500) return;
                    onOpenNews?.();
                }}
                className="absolute inset-0 z-0 h-full w-full"
            >
                {current.kind === 'video' ? (
                    <NewsVideo src={current.src} title={title} className="h-full w-full" />
                ) : (
                    <Image src={current.src} alt={title} width={960} height={540} quality={75} loading="lazy" unoptimized className="h-full w-full object-cover" />
                )}
            </button>

            {media.length > 1 && (
                <>
                    <button type="button" aria-label="Oldingi media" onClick={(event) => { event.stopPropagation(); move(-1); }} className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/75 text-white hover:bg-amber-500 hover:text-slate-950">‹</button>
                    <button type="button" aria-label="Keyingi media" onClick={(event) => { event.stopPropagation(); move(1); }} className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/75 text-white hover:bg-amber-500 hover:text-slate-950">›</button>
                    <span className="pointer-events-none absolute bottom-2 right-2 z-10 rounded bg-slate-950/75 px-2 py-1 text-[10px] font-semibold text-white">{currentIndex + 1} / {media.length}</span>
                </>
            )}
            {current.kind === 'video' && <span className="pointer-events-none absolute left-2 top-2 z-10 rounded bg-amber-400 px-2 py-1 text-[10px] font-black text-slate-950">VIDEO</span>}
        </div>
    );
}
