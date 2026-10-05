'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { getSafeImageSource } from '@/lib/imageSource';

interface NewsCardCarouselProps {
  images: string[];
  title: string;
  onOpenNews: () => void;
}

export default function NewsCardCarousel({ images, title, onOpenNews }: NewsCardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const lastSwipeAt = useRef(0);

  const move = (direction: -1 | 1) => {
    setCurrentIndex((index) => (index + direction + images.length) % images.length);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 40) return;
    lastSwipeAt.current = Date.now();
    move(distance < 0 ? 1 : -1);
  };

  return (
    <div
      className="group/carousel pointer-events-auto relative mb-4 h-48 w-full touch-pan-y overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
      onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        aria-label={`Yangilikni to‘liq ochish: ${title}`}
        onClick={() => {
          if (Date.now() - lastSwipeAt.current < 500) return;
          onOpenNews();
        }}
        onKeyDown={(event) => {
          if (images.length < 2) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            move(event.key === 'ArrowRight' ? 1 : -1);
          }
        }}
        className="absolute inset-0 z-0 block h-full w-full"
      >
        {images.map((image, index) => (
          index === currentIndex && getSafeImageSource(image) ? (
            <Image
              key={`${(image || '').slice(0, 40)}-${index}`}
              src={getSafeImageSource(image) || '/images/IIV_logo.png'}
              alt={`${title} — ${index + 1}-rasm`}
              width={960}
              height={540}
              quality={75}
              loading="lazy"
              unoptimized
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null
        ))}
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Oldingi rasm"
            onClick={(event) => { event.stopPropagation(); move(-1); }}
            className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/75 text-white opacity-100 transition-opacity hover:bg-amber-500 hover:text-slate-950 sm:opacity-0 sm:group-hover/carousel:opacity-100"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Keyingi rasm"
            onClick={(event) => { event.stopPropagation(); move(1); }}
            className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/75 text-white opacity-100 transition-opacity hover:bg-amber-500 hover:text-slate-950 sm:opacity-0 sm:group-hover/carousel:opacity-100"
          >
            ›
          </button>
          <span aria-live="polite" className="pointer-events-none absolute bottom-2 right-2 z-10 bg-slate-950/75 px-2 py-1 text-[10px] font-semibold text-white">
            {currentIndex + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
}
