'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Trash2, RefreshCw, Link as LinkIcon, CheckCircle2, Clipboard } from 'lucide-react';

interface ProofImageUploaderProps {
  imageValue: string | null;
  urlValue?: string;
  onImageChange: (dataUrl: string | null) => void;
  onUrlChange?: (url: string) => void;
  theme?: 'purple' | 'amber' | 'blue';
}

export default function ProofImageUploader({
  imageValue,
  urlValue = '',
  onImageChange,
  onUrlChange,
  theme = 'purple',
}: ProofImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageMeta, setImageMeta] = useState<{ name: string; sizeText: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [justPasted, setJustPasted] = useState(false);

  const colors = {
    purple: {
      border: 'border-purple-500/40',
      activeBorder: 'border-purple-500',
      bgHover: 'hover:bg-purple-500/10',
      btn: 'bg-purple-600 hover:bg-purple-500 text-white',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: 'text-purple-400',
    },
    amber: {
      border: 'border-amber-500/40',
      activeBorder: 'border-amber-500',
      bgHover: 'hover:bg-amber-500/10',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: 'text-amber-400',
    },
    blue: {
      border: 'border-blue-500/40',
      activeBorder: 'border-blue-500',
      bgHover: 'hover:bg-blue-500/10',
      btn: 'bg-blue-600 hover:bg-blue-500 text-white',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: 'text-blue-400',
    },
  }[theme];

  // Helper: Read and compress image to avoid huge payloads and speed up processing
  const processImageFile = (file: File | Blob, customName?: string) => {
    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir resim dosyası seçin (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new window.Image();
      img.onload = () => {
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const approxKb = Math.round((dataUrl.length * 0.75) / 1024);
          setImageMeta({
            name: customName || (file as File).name || 'ekran-goruntusu.png',
            sizeText: `${approxKb} KB`,
          });
          onImageChange(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // High quality JPEG for rapid transfer and sharp rendering
        const compressedUrl = canvas.toDataURL('image/jpeg', 0.88);
        const approxBytes = Math.round((compressedUrl.length - 'data:image/jpeg;base64,'.length) * 0.75);
        const sizeKb = Math.round(approxBytes / 1024);

        setImageMeta({
          name: customName || (file as File).name || 'ekran-goruntusu.jpg',
          sizeText: sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`,
        });
        onImageChange(compressedUrl);
        setJustPasted(true);
        setTimeout(() => setJustPasted(false), 2500);
      };

      img.onerror = () => {
        const approxKb = Math.round((dataUrl.length * 0.75) / 1024);
        setImageMeta({
          name: customName || (file as File).name || 'resim.png',
          sizeText: `${approxKb} KB`,
        });
        onImageChange(dataUrl);
      };

      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste handler (supports Win+Shift+S snipping tool screenshots)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept if focused on text input / textarea unless it contains an image file
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file, `Pano Görseli (Ctrl+V)`);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImageChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    setImageMeta(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Label and Status */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] sm:text-xs font-bold text-gray-300 flex items-center gap-1.5">
          <ImageIcon className={`w-3.5 h-3.5 ${colors.icon}`} />
          <span>Kanıt Resmi (Ekran Görüntüsü)</span>
        </label>
        <span className="text-[10px] text-gray-400 font-medium">Opsiyonel</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* When Image is Selected -> Show Preview Card */}
      {imageValue ? (
        <div className="relative rounded-2xl border border-white/10 bg-black/60 p-3 overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-150">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Image Thumbnail */}
            <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 group">
              <img
                src={imageValue}
                alt="Kanıt Görseli Önizleme"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Meta and Details */}
            <div className="flex-1 min-w-0 space-y-1 w-full text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Görsel Hazır
                </span>
                {justPasted && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold animate-pulse">
                    <Clipboard className="w-3 h-3" />
                    Panodan Yapıştırıldı!
                  </span>
                )}
                {imageMeta?.sizeText && (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400 text-[10px] font-mono">
                    {imageMeta.sizeText}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-white truncate">
                {imageMeta?.name || 'Ekran Görüntüsü'}
              </p>
              <p className="text-[10px] text-gray-400">
                Bu görsel Discord botu tarafından doğrudan uyarı loguna eklenecek ve sicile işlenecektir.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-gray-200 text-[11px] font-semibold transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Değiştir
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[11px] font-semibold transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                  Kaldır
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* When No Image -> Interactive Dropzone & File Select & Paste Area */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          tabIndex={0}
          role="button"
          className={`relative rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all outline-none ${
            isDragging
              ? `${colors.activeBorder} bg-white/[0.08] scale-[1.01]`
              : `border-white/15 bg-white/[0.02] ${colors.bgHover} hover:border-white/30`
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
              <Upload className={`w-5 h-5 ${colors.icon}`} />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${colors.btn}`}>
                  📁 Cihazdan Resim Seç
                </span>
                <span className="text-xs text-gray-400">veya</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 text-gray-200 border border-white/10 text-xs font-medium">
                  <Clipboard className="w-3 h-3 text-gray-400" />
                  Ctrl + V ile Yapıştır
                </span>
              </div>
              <p className="text-[11px] text-gray-400 pt-1">
                Win + Shift + S ile aldığınız ekran görüntüsünü sayfadayken doğrudan yapıştırabilirsiniz.
              </p>
              <p className="text-[10px] text-gray-400">
                PNG, JPG, WEBP desteklenir (otomatik optimize edilir).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Optional fallback for external video / streamable URLs */}
      {onUrlChange && (
        <div className="pt-1">
          {!showUrlInput && !urlValue ? (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-[11px] text-gray-400 hover:text-gray-300 flex items-center gap-1 transition-colors"
            >
              <LinkIcon className="w-3 h-3" />
              <span>Resim yerine harici video/klip linki (Streamable, Medal vb.) eklemek için tıkla</span>
            </button>
          ) : (
            <div className="space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-gray-400" />
                  Harici Video / Kanıt Linki
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowUrlInput(false);
                    onUrlChange('');
                  }}
                  className="text-gray-400 hover:text-gray-300 text-[10px]"
                >
                  Gizle / Temizle
                </button>
              </div>
              <input
                type="url"
                value={urlValue}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="https://streamable.com/... veya https://medal.tv/..."
                className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs placeholder:text-gray-400 focus:outline-none focus:border-white/30"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
