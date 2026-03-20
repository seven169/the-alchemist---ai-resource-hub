import React, { useState } from 'react';
import { 
  X, 
  Link as LinkIcon, 
  Terminal, 
  LayoutGrid,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { ImageUploader } from './admin/ImageUploader'; // Reuse the new uploader

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<'website' | 'prompt' | 'case'>('website');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'UI 界面',
    tags: '',
    image: '',
    url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error('请填写资源名称');

    setIsSubmitting(true);
    const payload: any = {
      id: `${type}-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      image: formData.image,
    };

    if (type === 'website') payload.url = formData.url;
    if (type === 'case') payload.status = 'Completed';

    const { error } = await supabase.from(`${type}s`).insert([payload]);

    setIsSubmitting(false);

    if (error) {
      toast.error('提交失败: ' + error.message);
    } else {
      toast.success('资源已成功入库！');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/80 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-card-dark rounded-[32px] border border-white/10 shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
          >
            <div className="p-8 md:p-12 space-y-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-headline font-bold text-white">录入新资源</h2>
                  <p className="text-white/40 text-sm mt-1">贡献你的炼金发现，资源将直接写入系统。</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex p-1 bg-bg-dark rounded-2xl relative">
                {[
                  { id: 'website', label: '网址', icon: LinkIcon },
                  { id: 'prompt', label: 'PROMPT', icon: Terminal },
                  { id: 'case', label: '案例', icon: LayoutGrid },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setType(item.id as any);
                      // Reset some form data when switching types
                      setFormData(prev => ({ ...prev, url: '' }));
                    }}
                    className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-headline font-bold transition-all z-10 ${
                      type === item.id 
                        ? 'text-primary-neon' 
                        : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {type === item.id && (
                      <motion.div 
                        layoutId="activeResourceType"
                        className="absolute inset-0 bg-card-high rounded-xl shadow-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest ml-1">资源名称 Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="例如: Midjourney v6 摄影提示词"
                    className="w-full bg-bg-dark border border-white/5 rounded-xl py-4 px-6 text-white focus:ring-1 focus:ring-primary-neon/30 transition-all outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest ml-1">分类 Category</label>
                    <div className="relative">
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-bg-dark border border-white/5 rounded-xl py-4 px-6 text-white appearance-none focus:ring-1 focus:ring-primary-neon/30 outline-none"
                      >
                        <option>UI 界面</option>
                        <option>插画设计</option>
                        <option>3D 渲染</option>
                        <option>Image Gen</option>
                        <option>LLM</option>
                        <option>AIGC</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest ml-1">标签 Tags</label>
                    <input 
                      type="text" 
                      value={formData.tags}
                      onChange={e => setFormData({...formData, tags: e.target.value})}
                      placeholder="用逗号分隔"
                      className="w-full bg-bg-dark border border-white/5 rounded-xl py-4 px-6 text-white focus:ring-1 focus:ring-primary-neon/30 transition-all outline-none"
                    />
                  </div>
                </div>

                {type === 'website' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest ml-1">网址链接 URL</label>
                    <input 
                      type="url" 
                      value={formData.url}
                      onChange={e => setFormData({...formData, url: e.target.value})}
                      placeholder="https://"
                      className="w-full bg-bg-dark border border-white/5 rounded-xl py-4 px-6 text-white focus:ring-1 focus:ring-primary-neon/30 transition-all outline-none"
                      required={type === 'website'}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest ml-1">封面图片 Cover Image</label>
                  <div className="p-4 rounded-xl border border-white/5 bg-bg-dark/50">
                    <ImageUploader 
                      value={formData.image} 
                      onChange={url => setFormData({...formData, image: url})} 
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center py-5 rounded-2xl bg-gradient-to-br from-white to-primary-neon text-bg-dark font-headline font-bold text-lg shadow-xl shadow-primary-neon/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '正在提交...' : '确认入库'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
