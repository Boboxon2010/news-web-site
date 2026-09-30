// src/app/admin/news/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Tadbir',
    summary: '',
    content: ''
  });

  // Rasm tanlanganda preview hosil qilish
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Yangilikni saqlash so'rovi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Real ilovada backend API ga Multipart/Form-data yuboriladi
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('category', formData.category);
      payload.append('summary', formData.summary);
      payload.append('content', formData.content);
      if (selectedImage) {
        payload.append('coverImage', selectedImage);
      }

      console.log("Submitting payload to FastAPI backend...");
      
      // Simulyatsiya (1.5 soniyadan keyin yangiliklar sahifasiga o'tadi)
      setTimeout(() => {
        setLoading(false);
        router.push('/news');
      }, 1500);

    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-8">
        
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-slate-900">Yangi Yangilik Chop Etish</h1>
          <p className="text-xs text-slate-500 mt-1">
            Saytga yangilik, e'lon yoki foto-lavhalar joylash paneli (Muharrirlar uchun)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Sarlavha */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Yangilik Sarlavhasi *
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Litseyda navbatdagi tanlov bo'lib o'tdi"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:outline-none text-sm"
            />
          </div>

          {/* Kategoriya */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Kategoriya *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:outline-none text-sm bg-white"
            >
              <option value="Tadbir">Tadbir</option>
              <option value="E'lon">E'lon</option>
              <option value="Yutuqlar">Yutuqlar</option>
              <option value="Qabul">Qabul - 2026</option>
            </select>
          </div>

          {/* Rasm Yuklash (Cover Image) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Asosiy Rasm Yuklash (JPG, PNG, WEBP) *
            </label>
            
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-900 transition-colors bg-slate-50 relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {imagePreview ? (
                <div className="space-y-2">
                  <img src={imagePreview} alt="Preview" className="h-48 mx-auto rounded-xl object-cover" />
                  <p className="text-xs text-slate-500">Rasmni o'zgartirish uchun bosing</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg className="w-10 h-10 text-slate-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4-5 4 5 4-5 4 5M4 8h16M4 4h16" />
                  </svg>
                  <p className="text-xs font-semibold text-slate-600">Rasm faylini shyerga tashlang yoki bosing</p>
                  <p className="text-[10px] text-slate-400">Maksimal hajm: 5 MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Qisqa mazmun (Summary) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Qisqa Mazmuni (Kartochkada ko'rinadi) *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Yangilikning 2-3 cümlalik qisqacha mazmuni..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:outline-none text-sm"
            />
          </div>

          {/* To'liq Matn */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              To'liq Matn *
            </label>
            <textarea
              rows={8}
              required
              placeholder="Yangilikning to'liq matnini kiriting..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:outline-none text-sm"
            />
          </div>

          {/* Saqlash Tugmasi */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl text-xs font-bold text-white bg-blue-950 hover:bg-slate-900 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? "Chop etilmoqda..." : "Yangilikni Chop Etish"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}