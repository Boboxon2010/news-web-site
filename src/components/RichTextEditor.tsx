'use client';

import React, { useRef, useEffect } from 'react';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Matnni shu yerga kiriting..." }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    const sanitizedValue = sanitizeHtml(value || '');
    if (editorRef.current && editorRef.current.innerHTML !== sanitizedValue) {
      editorRef.current.innerHTML = sanitizedValue;
    }
  }, [value]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (editorRef.current && selection?.rangeCount && editorRef.current.contains(selection.anchorNode)) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !savedRangeRef.current || !editorRef.current) return;
    editorRef.current.focus();
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  };

  const execCommand = (command: string, arg: string | undefined = undefined) => {
    restoreSelection();
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    saveSelection();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    saveSelection();
  };

  const addLink = () => {
    const url = prompt("Havola (URL) manzilini kiriting:", "https://");
    if (url?.trim()) {
      execCommand("createLink", url);
    }
  };

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm focus-within:border-amber-400 transition-all">
      <div onMouseDown={saveSelection} className="flex items-center gap-1 border-b border-slate-200 bg-slate-100 p-2 text-slate-700 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200">
        <button type="button" onClick={() => execCommand('bold')} title="Qalin" aria-label="Qalin" className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 font-black hover:bg-slate-200 dark:border-slate-600 dark:hover:bg-slate-700">B</button>
        <button type="button" onClick={() => execCommand('italic')} title="Kursiv" aria-label="Kursiv" className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 font-serif italic hover:bg-slate-200 dark:border-slate-600 dark:hover:bg-slate-700">I</button>
        <button type="button" onClick={() => execCommand('underline')} title="Tagiga chizish" aria-label="Tagiga chizish" className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 underline hover:bg-slate-200 dark:border-slate-600 dark:hover:bg-slate-700">U</button>
        <button type="button" onClick={addLink} title="Havola qo‘shish" aria-label="Havola qo‘shish" className="flex h-8 items-center gap-1 rounded border border-slate-300 px-2 text-xs font-semibold hover:bg-slate-200 dark:border-slate-600 dark:hover:bg-slate-700">
          <span aria-hidden="true">↗</span> Havola
        </button>
      </div>

      {/* Matn Yozish Maydoni */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        role="textbox"
        aria-label="Yangilikning to‘liq matni"
        aria-multiline="true"
        aria-required="true"
        data-placeholder={placeholder}
        suppressContentEditableWarning
        className="p-4 min-h-[220px] max-h-[500px] overflow-y-auto outline-none text-sm text-slate-800 dark:text-slate-100 prose dark:prose-invert max-w-none leading-relaxed empty:before:content-[attr(data-placeholder)] before:text-slate-400"
      />
    </div>
  );
}
