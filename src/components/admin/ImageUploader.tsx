import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > height && width > maxDim) {
            height = (height * maxDim) / width;
            width = maxDim;
          } else if (height > maxDim) {
            width = (width * maxDim) / height;
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas toBlob failed'));
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = () => reject(new Error('Image load failed'));
      };
      reader.onerror = () => reject(new Error('FileReader failed'));
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Compress image
      const compressedBlob = await compressImage(file);
      
      // Create a unique file name
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.jpg`;
      const filePath = `uploads/${fileName}`;

      // Upload the file to 'images' bucket
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Fetch the public URL from the bucket
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success('上传并压缩成功');
    } catch (error: any) {
      toast.error('上传失败: ' + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input 
          type="text" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="flex-1 bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-neon focus:outline-none placeholder:text-white/20" 
          placeholder="上传后这里会自动填入链接，也可手动粘贴网络图片..."
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-primary-neon/10 text-primary-neon hover:bg-primary-neon/20 rounded-lg transition-colors flex items-center gap-2 font-bold whitespace-nowrap disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {isUploading ? '正在上传...' : '上传本地图'}
        </button>
      </div>
      
      {value && (
        <div className="relative inline-block border border-white/10 rounded-xl p-1 bg-card-dark shadow-xl hover:-translate-y-1 transition-transform">
          <img src={value} alt="Preview" className="h-24 w-auto object-cover rounded-lg" />
          <button 
            type="button" 
            onClick={() => onChange('')} 
            className="absolute -top-3 -right-3 bg-red-500/80 text-white rounded-full p-1.5 hover:bg-red-500 shadow-xl backdrop-blur-sm transition-colors"
            title="移除图片"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
