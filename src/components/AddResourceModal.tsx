import React, { useState } from 'react';
import { 
  X, 
  Link as LinkIcon, 
  Terminal, 
  LayoutGrid,
  ChevronDown,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { ImageUploader } from './admin/ImageUploader';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<'website' | 'prompt' | 'case'>('website');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dynamic form state based on all possible fields across the 3 types
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    category: 'UI 界面',
    tags: '',
    image: '',
    url: '',
    // Prompt specific
    positive: '',
    negative: '',
    model: '',
    sampler: '',
    steps: 20,
    cfg: 7.0,
    seed: '',
    size: '1024x1024',
    // Case specific
    status: 'Completed'
  });

  const resetForm = (newType?: 'website' | 'prompt' | 'case') => {
    const activeType = newType || type;
    setFormData({
      title: '',
      description: '',
      category: activeType === 'website' ? 'UI 界面' : (activeType === 'prompt' ? 'Image Gen' : 'AIGC'),
      tags: '',
      image: '',
      url: '',
      positive: '',
      negative: '',
      model: '',
      sampler: '',
      steps: 20,
      cfg: 7.0,
      seed: '',
      size: '1024x1024',
      status: 'Completed'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error('请填写资源标题');

    setIsSubmitting(true);
    
    // Prepare payload based on type to match table structure
    let payload: any = {
      id: `${type}-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      image: formData.image,
    };

    if (type === 'website') {
      payload.url = formData.url;
    } else if (type === 'prompt') {
      payload = {
        ...payload,
        positive: formData.positive,
        negative: formData.negative,
        model: formData.model,
        sampler: formData.sampler,
        steps: formData.steps,
        cfg: formData.cfg,
        seed: formData.seed,
        size: formData.size,
        rating: 5.0
      };
    } else if (type === 'case') {
      payload.status = formData.status;
    }

    try {
      const { error } = await supabase.from(`${type}s`).insert([payload]);
      if (error) throw error;
      
      toast.success('资源已成功入库！');
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error('提交失败: ' + error.message);
    } finally {
      setIsSubmitting(false);
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
            className="relative w-full max-w-lg bg-card-dark rounded-2xl border border-white/10 shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
          >
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-headline font-bold text-white">录入新资源</h2>
                  <p className="text-white/30 text-xs mt-1">贡献你的炼金发现，所有字段将同步至后台。</p>
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
                      resetForm(item.id as any);
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
                {/* Common Fields */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest ml-1">标题 Title *</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="录入标题..."
                      className="w-full bg-bg-dark border border-white/5 rounded-xl py-4 px-6 text-white focus:ring-1 focus:ring-primary-neon/30 transition-all outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest ml-1">分类 Category</label>
                    {type === 'website' ? (
                      <div className="relative">
                        <select 
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-bg-dark border border-white/5 rounded-xl py-4 px-6 text-white appearance-none focus:ring-1 focus:ring-primary-neon/30 outline-none"
                        >
                          <option>UI 界面</option>
                          <option>插画设计</option>
                          <option>3D 渲染</option>
                          <option>平面海报</option>
                          <option>摄影大片</option>
                          <option>Image Gen</option>
                          <option>LLM</option>
                          <option>Search</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-bg-dark border border-white/5 rounded-xl py-4 px-6 text-white focus:ring-1 focus:ring-primary-neon/30 transition-all outline-none"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest ml-1">描述 Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="简短描述..."
                    className="w-full bg-bg-dark border border-white/5 rounded-xl py-4 px-6 text-white focus:ring-1 focus:ring-primary-neon/30 transition-all h-20 outline-none resize-none"
                  />
                </div>

                {/* Type Specific Fields */}
                {type === 'website' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest ml-1">网址链接 URL</label>
                    <input 
                      type="url" 
                      value={formData.url}
                      onChange={e => setFormData({...formData, url: e.target.value})}
                      placeholder="https://"
                      className="w-full bg-bg-dark border border-white/5 rounded-xl py-4 px-6 text-white focus:ring-1 focus:ring-primary-neon/30 transition-all outline-none"
                      required
                    />
                  </div>
                )}

                {type === 'prompt' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest ml-1">正向提示词 Positive *</label>
                      <textarea 
                        required
                        value={formData.positive}
                        onChange={e => setFormData({...formData, positive: e.target.value})}
                        className="w-full bg-bg-dark border border-white/5 rounded-xl py-4 px-6 text-white focus:ring-1 focus:ring-primary-neon/30 transition-all h-24 outline-none resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest ml-1">反向提示词 Negative</label>
                      <textarea 
                        value={formData.negative}
                        onChange={e => setFormData({...formData, negative: e.target.value})}
                        className="w-full bg-bg-dark border border-white/5 rounded-xl py-4 px-6 text-white focus:ring-1 focus:ring-primary-neon/30 transition-all h-16 outline-none resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/20">模型 Model</label>
                        <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-bg-dark border border-white/5 rounded-lg p-3 text-white focus:ring-1 focus:ring-primary-neon/30 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/20">采样 Sampler</label>
                        <input type="text" value={formData.sampler} onChange={e => setFormData({...formData, sampler: e.target.value})} className="w-full bg-bg-dark border border-white/5 rounded-lg p-3 text-white focus:ring-1 focus:ring-primary-neon/30 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/20">步数 Steps</label>
                        <input type="number" value={formData.steps} onChange={e => setFormData({...formData, steps: Number(e.target.value)})} className="w-full bg-bg-dark border border-white/5 rounded-lg p-3 text-white focus:ring-1 focus:ring-primary-neon/30 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/20">CFG</label>
                        <input type="number" step="0.1" value={formData.cfg} onChange={e => setFormData({...formData, cfg: Number(e.target.value)})} className="w-full bg-bg-dark border border-white/5 rounded-lg p-3 text-white focus:ring-1 focus:ring-primary-neon/30 text-xs" />
                      </div>
                    </div>
                  </>
                )}

                {type === 'case' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest ml-1">实验状态 Status</label>
                    <div className="relative">
                      <select 
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-full bg-bg-dark border border-white/5 rounded-xl py-4 px-6 text-white appearance-none focus:ring-1 focus:ring-primary-neon/30 outline-none"
                      >
                        <option value="Completed">Completed (已完成)</option>
                        <option value="In Progress">In Progress (进行中)</option>
                        <option value="Draft">Draft (草稿)</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest ml-1">标签与封面 Tags & Image</label>
                  <div className="p-6 rounded-2xl border border-white/5 bg-bg-dark/50 space-y-6">
                    <div>
                      <label className="block text-[10px] text-white/20 mb-2">标签 (逗号分隔)</label>
                      <input 
                        type="text" 
                        value={formData.tags}
                        onChange={e => setFormData({...formData, tags: e.target.value})}
                        placeholder="例如: 简约, 极客, 灵感"
                        className="w-full bg-bg-dark/50 border border-white/5 rounded-lg p-3 text-white focus:ring-1 focus:ring-primary-neon/30 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/20 mb-2">封面图片</label>
                      <ImageUploader 
                        value={formData.image} 
                        onChange={url => setFormData({...formData, image: url})} 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-bg-dark border border-primary-neon/40 text-primary-neon font-headline font-bold text-sm tracking-widest shadow-lg shadow-primary-neon/10 hover:bg-primary-neon/10 hover:border-primary-neon active:scale-[0.99] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    {isSubmitting ? '正在提交...' : '确认同步入库'}
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
