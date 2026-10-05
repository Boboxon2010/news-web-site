'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getSafeImageSource } from '@/lib/imageSource';

interface ImageGalleryViewerProps {
  images: string[];
  altTitle?: string;
  className?: string;
  modalOnly?: boolean;
  onClose?: () => void;
}

export default function ImageGalleryViewer({ images, altTitle = 'Rasm', className = '', modalOnly = false, onClose }: ImageGalleryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(modalOnly);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const closeGallery = () => {
    setIsOpen(false);
    setScale(1);
    setRotation(0);
    onClose?.();
  };

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeGallery();
      if (event.key === 'ArrowLeft' && images.length > 1) {
        event.preventDefault();
        setCurrentIndex((index) => (index === 0 ? images.length - 1 : index - 1));
        setScale(1);
      }
      if (event.key === 'ArrowRight' && images.length > 1) {
        event.preventDefault();
        setCurrentIndex((index) => (index === images.length - 1 ? 0 : index + 1));
        setScale(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [images.length, isOpen, onClose]);

  if (!images || images.length === 0) return null;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setScale(1);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setScale(1);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.3, 3.5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.3, 0.4));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
    setRotation(0);
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `litsey-rasm-${currentIndex + 1}.png`;
    link.click();
  };

  return (
    <>
    {!modalOnly && <div className={`space-y-3 ${className}`}>
      
      {/* Asosiy Rasm Va Slider */}
      <div className="relative group rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div
          className="relative w-full h-64 sm:h-80 md:h-96 cursor-pointer flex items-center justify-center overflow-hidden"
          onClick={() => setIsOpen(true)}
        >
          <Image
            src={getSafeImageSource(images[currentIndex]) || '/images/IIV_logo.png'}
            alt={`${altTitle} - ${currentIndex + 1}`}
            width={1600}
            height={1200}
            quality={75}
            loading="lazy"
            unoptimized
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2 backdrop-blur-[2px]">
            <span className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700 shadow-xl">🔍 Kattalashtirib va Uskunalarni Ochish</span>
          </div>
        </div>

        {/* Surish Tugmalari (❮ va ❯) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-amber-500 text-white hover:text-slate-950 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base backdrop-blur-md shadow-2xl transition-all border border-slate-700/80"
              title="Oldingi rasm"
            >
              ❮
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-amber-500 text-white hover:text-slate-950 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base backdrop-blur-md shadow-2xl transition-all border border-slate-700/80"
              title="Keyingi rasm"
            >
              ❯
            </button>

            {/* Paginatsiya Nuqtalari (Dots) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/70 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-slate-800">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white'
                  }`}
                  title={`Rasm ${idx + 1}`}
                />
              ))}
              <span className="text-[10px] text-amber-400 font-mono ml-1 font-bold">
                {currentIndex + 1}/{images.length}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Mini Galereya Ko'rinishi (Thumbnails) */}
      {images.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                idx === currentIndex
                  ? 'border-amber-400 scale-105 shadow-lg ring-2 ring-amber-400/30'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={getSafeImageSource(img) || '/images/IIV_logo.png'} alt={`Thumb ${idx}`} width={64} height={64} quality={75} loading="lazy" unoptimized className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>}

      {isOpen && (
        <div role="dialog" aria-modal="true" aria-label={`${altTitle} galereyasi`} onClick={(event) => { if (event.target === event.currentTarget) closeGallery(); }} className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col justify-between p-4 sm:p-6">
          
          {/* Tepa Uskunalar Paneli */}
          <div className="flex justify-between items-center text-white z-10 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-2xl">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <span>🖼️ Rasm {currentIndex + 1} / {images.length}</span>
              <span className="text-slate-400 font-normal">({Math.round(scale * 100)}%)</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleZoomIn}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm transition-all border border-slate-700"
                title="Kattalashtirish (+)"
              >
                🔍+
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm transition-all border border-slate-700"
                title="Kichiklashtirish (-)"
              >
                🔍-
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all border border-slate-700"
                title="Asl holatiga qaytarish"
              >
                🔄 100%
              </button>
              <button
                type="button"
                onClick={handleRotate}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all border border-slate-700"
                title="Aylantirish 90°"
              >
                ↻ 90°
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold transition-all shadow-lg"
                title="Yuklab olish"
              >
                ⬇ Yuklab olish
              </button>
              <button
                type="button"
                onClick={closeGallery}
                className="bg-red-600 hover:bg-red-700 text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base transition-all ml-2"
                title="Yopish (Esc)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Markaziy Rasm (Zoom & Rotate Bilan) */}
          <div className="flex-1 flex items-center justify-center overflow-hidden my-4 relative">
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 bg-slate-900/90 hover:bg-amber-500 text-white hover:text-slate-950 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl backdrop-blur-md z-20 transition-all border border-slate-700"
              >
                ❮
              </button>
            )}

            <div className="max-w-full max-h-full flex items-center justify-center overflow-auto p-4">
              <Image
                src={getSafeImageSource(images[currentIndex]) || '/images/IIV_logo.png'}
                alt="Fullscreen View"
                width={1600}
                height={1200}
                quality={75}
                loading="lazy"
                unoptimized
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out',
                }}
                className="max-w-full max-h-[75vh] object-contain select-none rounded-2xl shadow-2xl"
              />
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 bg-slate-900/90 hover:bg-amber-500 text-white hover:text-slate-950 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl backdrop-blur-md z-20 transition-all border border-slate-700"
              >
                ❯
              </button>
            )}
          </div>

          {/* Pastki Paginatsiya */}
          {images.length > 1 && (
            <div className="flex justify-center items-center gap-2 py-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setScale(1);
                  }}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentIndex ? 'w-8 bg-amber-400' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          )}

        </div>
      )}

    </>
  );
}
