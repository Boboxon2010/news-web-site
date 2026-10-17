'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStoredId, getStoredNews, NewsItem, saveStoredNews } from '@/lib/dataStore';
import ImageUploadDropzone from '@/components/ui/ImageUploadDropzone';
import RichTextEditor from '@/components/RichTextEditor';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

const today = () => new Date().toLocaleDateString('uz-UZ');
const emptyForm = { title: '', category: 'Tadbir', date: today(), shortDesc: '', fullContent: '' };

function uploadFile(file: File, onProgress: (percent: number) => void): Promise<{ id: string; name: string; dataUrl: string; type: string }> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', '/api/uploads');
    request.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    request.setRequestHeader('X-File-Name', file.name);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      try {
        const result = JSON.parse(request.responseText);
        if (request.status >= 200 && request.status < 300 && result.success) resolve(result);
        else reject(new Error(result.error || 'Faylni yuklashda xatolik yuz berdi.'));
      } catch {
        reject(new Error('Server javobini o‘qib bo‘lmadi.'));
      }
    };
    request.onerror = () => reject(new Error('Faylni serverga yuklashda xatolik yuz berdi.'));
    request.onabort = () => reject(new Error('Fayl yuklash bekor qilindi.'));
    request.send(file);
  });
}

async function dataUrlToFile(dataUrl: string, index: number): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], `news-image-${index + 1}.${blob.type.split('/')[1] || 'jpg'}`, { type: blob.type });
}

export default function CreateNewsForm() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<NewsItem['videos']>([]);
  const [existingFiles, setExistingFiles] = useState<NewsItem['files']>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      const id = new URLSearchParams(window.location.search).get('id');
      if (!id) return;
      const storedItem = getStoredNews().find((news) => news.id === id);
      const response = await fetch(`/api/news/${encodeURIComponent(id)}`, { cache: 'no-store' }).catch(() => null);
      const serverItem = response?.ok ? await response.json() as NewsItem : null;
      const item = serverItem && storedItem && (storedItem.images?.length || 0) > (serverItem.images?.length || 0)
        ? { ...serverItem, images: Array.from(new Set([...(serverItem.images || []), ...(storedItem.images || [])])) }
        : serverItem || storedItem;
      if (!item) {
        setError('Yangilik topilmadi.');
        return;
      }
      setEditingId(item.id);
      setForm({
        title: item.title,
        category: item.category,
        date: item.date,
        shortDesc: item.shortDesc,
        fullContent: item.fullContent,
      });
      setImages(item.images || []);
      setVideos(item.videos || []);
      setExistingFiles(item.files || []);
    };
    void loadNews();
  }, []);

  const handleImages = async (files: File[]) => {
    setError('');
    try {
      setUploadProgress(0);
      const uploaded = await Promise.all(files.map((file, index) => uploadFile(file, (percent) => {
        setUploadProgress(Math.round(((index + percent / 100) / files.length) * 100));
      })));
      setImages((current) => [...current, ...uploaded.map((file) => file.dataUrl)]);
      setUploadProgress(null);
    } catch (uploadError) {
      setUploadProgress(null);
      setError(uploadError instanceof Error ? uploadError.message : 'Rasmni yuklashda xatolik yuz berdi.');
    }
  };

  const handleVideos = async (files: File[]) => {
    setError('');
    try {
      setUploadProgress(0);
      const uploaded = await Promise.all(files.map((file, index) => uploadFile(file, (percent) => {
        setUploadProgress(Math.round(((index + percent / 100) / files.length) * 100));
      })));
      setVideos((current) => [...(current || []), ...uploaded]);
      setUploadProgress(null);
    } catch (uploadError) {
      setUploadProgress(null);
      setError(uploadError instanceof Error ? uploadError.message : 'Videoni yuklashda xatolik yuz berdi.');
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safeFullContent = sanitizeHtml(form.fullContent);
    const plainFullContent = safeFullContent.replace(/<[^>]*>/g, '').replace(/&nbsp;|&#160;/gi, ' ').trim();
    if (!plainFullContent) {
      setError('Yangilikning to‘liq matnini kiriting.');
      return;
    }
    setSaving(true);
    setError('');
    const current = getStoredNews();
    let savedImages = images;
    try {
      const legacyImages = images.filter((image) => image.startsWith('data:'));
      if (legacyImages.length > 0) {
        setUploadProgress(0);
        const uploaded = await Promise.all(legacyImages.map(async (image, index) => {
          const file = await dataUrlToFile(image, index);
          return uploadFile(file, (percent) => {
            setUploadProgress(Math.round(((index + percent / 100) / legacyImages.length) * 100));
          });
        }));
        let uploadedIndex = 0;
        savedImages = images.map((image) => image.startsWith('data:') ? uploaded[uploadedIndex++].dataUrl : image);
      }
      setUploadProgress(null);
    } catch (uploadError) {
      setUploadProgress(null);
      setError(uploadError instanceof Error ? uploadError.message : 'Eski rasmlarni serverga ko‘chirishda xatolik yuz berdi.');
      setSaving(false);
      return;
    }
    const item: NewsItem = {
      id: editingId || createStoredId(),
      ...form,
      fullContent: safeFullContent,
      images: savedImages,
      files: [...(existingFiles || []), ...(videos || [])],
    };
    try {
      const response = await fetch('/api/news', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, date: item.date }),
      });
      if (response.ok) {
        const result = await response.json();
        item.id = String(result.id);
      } else if (response.status < 500 && response.status !== 404) {
        const result = await response.json();
        throw new Error(result.error || 'Yangilikni saqlab bo‘lmadi.');
      }
      const next = editingId
        ? current.map((news) => news.id === editingId ? item : news)
        : [item, ...current];
      saveStoredNews(next);
      router.push('/admin/news');
    } catch (saveError) {
      if (saveError instanceof Error && saveError.message !== 'Failed to fetch') {
        setError(saveError.message);
        setSaving(false);
        return;
      }
      setError('Saqlash amalga oshmadi. Rasm hajmini kamaytirib qayta urinib ko‘ring.');
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6 p-5 sm:p-8">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold uppercase text-amber-700">IIV Xorazm akademik litseyi</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{editingId ? 'Yangilikni tahrirlash' : 'Yangi yangilik'}</h1>
      </header>
      <form onSubmit={submit} className="space-y-5">
        <label className="block text-sm font-medium text-slate-700">Sarlavha
          <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2.5" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">Kategoriya
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2.5">
              <option>Tadbir</option><option>E'lon</option><option>Yutuqlar</option><option>Qabul</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">Sana
            <input required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2.5" />
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-700">Qisqacha mazmun
          <textarea required rows={3} value={form.shortDesc} onChange={(event) => setForm({ ...form, shortDesc: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2.5" />
        </label>
        <div className="space-y-1 text-sm font-medium text-slate-700">
          <p>To‘liq matn</p>
          <RichTextEditor value={form.fullContent} onChange={(fullContent) => setForm((current) => ({ ...current, fullContent }))} />
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="space-y-2 text-sm font-medium text-slate-700">
          <p>Videolar (hajm va son cheklovi yo‘q)</p>
          <ImageUploadDropzone label="Video tanlang yoki shu yerga tashlang" multiple accept="video/*" fileKind="video" maxFileSizeBytes={null} onFiles={handleVideos} onError={setError} />
        </div>
        {videos && videos.length > 0 && <div className="space-y-2">
          {videos.map((video, index) => <div key={`${video.dataUrl}-${index}`} className="flex items-center gap-3 rounded border border-slate-200 p-2 text-xs">
            <video src={video.dataUrl} controls preload="metadata" className="h-20 w-32 rounded bg-black" />
            <span className="min-w-0 flex-1 truncate">{video.name}</span>
            <button type="button" onClick={() => setVideos((current) => (current || []).filter((_, currentIndex) => currentIndex !== index))} className="text-red-700">Olib tashlash</button>
          </div>)}
        </div>}
        {uploadProgress !== null && <div className="space-y-1" role="status">
          <div className="h-2 w-full overflow-hidden rounded bg-slate-200"><div className="h-full bg-amber-500 transition-all" style={{ width: `${uploadProgress}%` }} /></div>
          <p className="text-xs text-slate-500">Yuklanmoqda: {uploadProgress}%</p>
        </div>}
        <div className="space-y-2 text-sm font-medium text-slate-700">
          <p>Rasmlar (hajm va son cheklovi yo‘q)</p>
          <ImageUploadDropzone label="Rasm tanlang yoki shu yerga tashlang" multiple maxFileSizeBytes={null} onFiles={handleImages} onError={setError} />
        </div>
        {images.length > 0 && <div className="flex flex-wrap gap-3">
          {images.map((image, index) => <div key={`${(image || '').slice(0, 40)}-${index}`} className="relative">
            <img src={image} alt={`Yangilik rasmi ${index + 1}`} className="h-20 w-24 rounded object-cover" />
            <button type="button" onClick={() => setImages((current) => current.filter((_, currentIndex) => currentIndex !== index))} aria-label={`${index + 1}-rasmni olib tashlash`} className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-700 text-white">×</button>
          </div>)}
        </div>}
        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
          <button disabled={saving} className="rounded bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">{saving ? 'Saqlanmoqda…' : 'Saqlash'}</button>
          <button type="button" onClick={() => router.push('/admin/news')} className="rounded border border-slate-300 px-4 py-2.5 text-sm">Bekor qilish</button>
        </div>
      </form>
    </section>
  );
}
