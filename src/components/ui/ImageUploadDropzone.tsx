'use client';

import { useRef, useState } from 'react';

interface ImageUploadDropzoneProps {
  label: string;
  multiple?: boolean;
  maxFileSizeBytes?: number;
  onFiles: (files: File[]) => void;
  onError: (message: string) => void;
}

export default function ImageUploadDropzone({
  label,
  multiple = false,
  maxFileSizeBytes = 900_000,
  onFiles,
  onError,
}: ImageUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const acceptFiles = (files: File[]) => {
    if (files.length === 0) return;

    if (files.some((file) => !file.type.startsWith('image/'))) {
      onError('Faqat rasm fayllarini tanlang.');
      return;
    }
    if (files.some((file) => file.size > maxFileSizeBytes)) {
      onError(`Har bir rasm hajmi ${(maxFileSizeBytes / 1_000_000).toFixed(1)} MB dan oshmasligi kerak.`);
      return;
    }

    onError('');
    onFiles(multiple ? files : [files[0]]);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const files = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);
    if (files.length === 0) return;
    event.preventDefault();
    acceptFiles(files);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${label}. Fayl tanlash, rasm tashlash yoki buferdan joylash`}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onPaste={handlePaste}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        acceptFiles(Array.from(event.dataTransfer.files));
      }}
      className={`cursor-pointer rounded border-2 border-dashed p-5 text-center text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${
        isDragOver
          ? 'border-amber-500 bg-amber-50 text-slate-900'
          : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-amber-500'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(event) => {
          acceptFiles(Array.from(event.target.files || []));
          event.target.value = '';
        }}
      />
      <span className="block font-semibold">{isDragOver ? 'Rasmlarni shu yerga tashlang' : label}</span>
      <span className="mt-1 block text-xs text-slate-500">Bosing, sudrab tashlang yoki Ctrl+V orqali joylang</span>
      <span className="mt-1 block text-xs text-slate-500">Har biri {(maxFileSizeBytes / 1_000_000).toFixed(1)} MB gacha</span>
    </div>
  );
}