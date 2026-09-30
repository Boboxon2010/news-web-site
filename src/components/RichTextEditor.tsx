'use client';

import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Matnni shu yerga kiriting..." }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = prompt("Havola (URL) manzilini kiriting:", "https://");
    if (url) {
      execCommand("createLink", url);
    }
  };

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm focus-within:border-amber-400 transition-all">
      {/* Word Tools Asboblar Paneli */}
      <div className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 p-2 flex flex-wrap items-center gap-1.5 text-slate-700 dark:text-slate-200 text-xs">
        
        {/* Sarlavha turlari */}
        <select
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs outline-none focus:border-amber-400"
          defaultValue="P"
        >
          <option value="P">Oddiy matn (P)</option>
          <option value="H1">Katta Sarlavha (H1)</option>
          <option value="H2">O'rta Sarlavha (H2)</option>
          <option value="H3">Kichik Sarlavha (H3)</option>
          <option value="BLOCKQUOTE">Iqtibos (Quote)</option>
        </select>

        <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1"></div>

        {/* Matn stili */}
        <button
          type="button"
          onClick={() => execCommand('bold')}
          title="Qalin (Bold) - Ctrl+B"
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-black text-sm w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          title="Og'ma (Italic) - Ctrl+I"
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg italic font-serif text-sm w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          title="Tagiga chizilgan (Underline) - Ctrl+U"
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg underline text-sm w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => execCommand('strikeThrough')}
          title="Ustidan chizilgan (Strikethrough)"
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg line-through text-sm w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700"
        >
          S
        </button>

        <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1"></div>

        {/* Daraja va Indeks (Superscript & Subscript) */}
        <button
          type="button"
          onClick={() => execCommand('superscript')}
          title="Daraja (Superscript) x²"
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-bold text-xs w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700"
        >
          x²
        </button>
        <button
          type="button"
          onClick={() => execCommand('subscript')}
          title="Indeks (Subscript) x₂"
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-bold text-xs w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700"
        >
          x₂
        </button>

        <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1"></div>

        {/* Tekislash */}
        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          title="Chapga tekislash"
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700"
        >
          ⇐
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          title="Markazga tekislash"
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700"
        >
          ⇔
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          title="O'ngga tekislash"
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700"
        >
          ⇒
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyFull')}
          title="Eniga tekislash (Justify)"
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700"
        >
          ≡
        </button>

        <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1"></div>

        {/* Ro'yxat */}
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          title="Nuqtali ro'yxat"
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700"
        >
          •=
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          title="Raqamli ro'yxat"
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700"
        >
          1.
        </button>

        <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1"></div>

        {/* Havola (Hyperlink) */}
        <button
          type="button"
          onClick={addLink}
          title="Havola qo'shish"
          className="p-1.5 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-lg text-xs flex items-center gap-1 border border-amber-500/30 px-2 h-7"
        >
          🔗 Havola
        </button>
        <button
          type="button"
          onClick={() => execCommand('unlink')}
          title="Havolani o'chirish"
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700"
        >
          ✂️
        </button>

        <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1"></div>

        {/* Matn va fon rangi */}
        <div className="flex items-center gap-1" title="Matn Rangi">
          <span className="text-[10px] font-semibold">Rang:</span>
          <input
            type="color"
            onChange={(e) => execCommand('foreColor', e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>

        <div className="flex items-center gap-1" title="Matn Fon Rangi (Highlight)">
          <span className="text-[10px] font-semibold">Fon:</span>
          <input
            type="color"
            defaultValue="#fef08a"
            onChange={(e) => execCommand('hiliteColor', e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>

        <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1"></div>

        {/* Formatni tozalash */}
        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          title="Formatni tozalash"
          className="p-1.5 hover:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs px-2 h-7 flex items-center border border-red-500/20"
        >
          🧹 Tozalash
        </button>
      </div>

      {/* Matn Yozish Maydoni */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 min-h-[220px] max-h-[500px] overflow-y-auto outline-none text-sm text-slate-800 dark:text-slate-100 prose dark:prose-invert max-w-none leading-relaxed"
      />
    </div>
  );
}
