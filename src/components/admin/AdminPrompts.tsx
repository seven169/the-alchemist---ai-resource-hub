import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Prompt } from '../../types';
import { Trash2, Edit, Plus, X, Save, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader } from './ImageUploader';

export const AdminPrompts: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    id: '', title: '', description: '', category: 'Image Gen', tags: '', image: '', rating: 5.0,
    positive: '', negative: '', model: '', sampler: '', steps: 20, cfg: 7.0, seed: '', size: '1024x1024'
  });

  const fetchPrompts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('prompts').select('*').order('sort_order', { ascending: true });
    if (error) toast.error('获取失败: ' + error.message);
    else if (data) {
      const mapped = data.map((p: any) => ({
        ...p, params: { model: p.model, sampler: p.sampler, steps: p.steps, cfg: p.cfg, seed: p.seed, size: p.size }
      }));
      setPrompts(mapped);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchPrompts(); }, []);

  const openForm = (prompt?: Prompt) => {
    if (prompt) {
      setEditingId(prompt.id);
      setFormData({
        id: prompt.id, title: prompt.title, description: prompt.description || '', category: prompt.category,
        tags: prompt.tags.join(', '), image: prompt.image || '', rating: prompt.rating || 5.0,
        positive: prompt.positive || '', negative: prompt.negative || '',
        model: prompt.params.model || '', sampler: prompt.params.sampler || '', steps: prompt.params.steps || 20,
        cfg: prompt.params.cfg || 7.0, seed: prompt.params.seed || '', size: prompt.params.size || '1024x1024'
      });
    } else {
      setEditingId(null);
      setFormData({
        id: `prompt-${Date.now()}`, title: '', description: '', category: 'Image Gen', tags: '', image: '', rating: 5.0,
        positive: '', negative: '', model: '', sampler: '', steps: 20, cfg: 7.0, seed: '', size: '1024x1024'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error('标题不能为空');

    const payload = {
      id: formData.id, title: formData.title, description: formData.description, category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean), image: formData.image, rating: formData.rating,
      positive: formData.positive, negative: formData.negative, model: formData.model, sampler: formData.sampler,
      steps: formData.steps, cfg: formData.cfg, seed: formData.seed, size: formData.size
    };

    if (editingId) {
      const { error } = await supabase.from('prompts').update(payload).eq('id', editingId);
      if (error) return toast.error('更新失败: ' + error.message);
      toast.success('更新成功');
    } else {
      const { error } = await supabase.from('prompts').insert([payload]);
      if (error) return toast.error('创建失败: ' + error.message);
      toast.success('创建成功');
    }
    setIsModalOpen(false);
    fetchPrompts();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除吗？该操作不可恢复。')) return;
    const { error } = await supabase.from('prompts').delete().eq('id', id);
    if (error) toast.error('删除失败: ' + error.message);
    else { toast.success('删除成功'); setPrompts(prompts.filter(w => w.id !== id)); }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newList = [...prompts];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    const currentOrder = (newList[index] as any).sort_order ?? index;
    const targetOrder = (newList[targetIndex] as any).sort_order ?? targetIndex;
    const [errA, errB] = await Promise.all([
      supabase.from('prompts').update({ sort_order: targetOrder }).eq('id', newList[index].id).then(r => r.error),
      supabase.from('prompts').update({ sort_order: currentOrder }).eq('id', newList[targetIndex].id).then(r => r.error),
    ]);
    if (errA || errB) return toast.error('排序失败');
    toast.success('顺序已更新');
    fetchPrompts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-headline font-bold text-white">提示词库管理 ({prompts.length})</h2>
        <div className="flex gap-4">
          <button onClick={fetchPrompts} className="p-2 text-white/50 hover:text-white bg-card-dark rounded-lg border border-white/10 transition-colors">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => openForm()} className="flex items-center gap-2 px-4 py-2 bg-primary-neon text-bg-dark font-bold rounded-lg hover:opacity-90 transition-opacity flex-shrink-0">
            <Plus className="w-5 h-5" /> 新增提示词
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-bg-dark">
        <table className="w-full text-left text-sm text-white/60">
          <thead className="bg-white/5 text-white/40 uppercase font-headline tracking-widest text-xs">
            <tr>
              <th className="px-4 py-3 min-w-[200px]">标题</th>
              <th className="px-4 py-3 min-w-[150px]">正向提示词摘要</th>
              <th className="px-4 py-3 min-w-[100px]">模型</th>
              <th className="px-4 py-3 min-w-[100px] text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {prompts.map((prompt, idx) => (
              <tr key={prompt.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-bold text-white truncate max-w-[150px]">{prompt.title}</p>
                  <p className="text-xs text-white/30 truncate max-w-[150px]">{prompt.category}</p>
                </td>
                <td className="px-4 py-3"><p className="text-xs truncate max-w-[200px] text-white/50">{prompt.positive}</p></td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-white/5 rounded text-xs">{prompt.params.model}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="p-1.5 text-white/20 hover:text-white disabled:opacity-20 bg-white/5 hover:bg-white/10 rounded transition-colors"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleMove(idx, 'down')} disabled={idx === prompts.length - 1} className="p-1.5 text-white/20 hover:text-white disabled:opacity-20 bg-white/5 hover:bg-white/10 rounded transition-colors"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={() => openForm(prompt)} className="p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(prompt.id)} className="p-1.5 text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-400/20 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {prompts.length === 0 && !isLoading && (
              <tr><td colSpan={4} className="text-center py-10">暂无数据</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-card-dark rounded-2xl border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <h3 className="text-xl font-headline font-bold text-white">{editingId ? '编辑提示词' : '新增提示词'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-1">ID *</label>
                  <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={!!editingId} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-1">标题 *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-neon" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 mb-1">正向提示词 (Positive)*</label>
                <textarea required value={formData.positive} onChange={e => setFormData({...formData, positive: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-neon h-20 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 mb-1">反向提示词 (Negative)</label>
                <textarea value={formData.negative} onChange={e => setFormData({...formData, negative: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-neon h-16 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-1">模型 (Model)</label>
                  <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-neon" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-1">采样器 (Sampler)</label>
                  <input type="text" value={formData.sampler} onChange={e => setFormData({...formData, sampler: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-neon" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-1">步数 (Steps)</label>
                  <input type="number" value={formData.steps} onChange={e => setFormData({...formData, steps: Number(e.target.value)})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-neon" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-1">CFG</label>
                  <input type="number" step="0.1" value={formData.cfg} onChange={e => setFormData({...formData, cfg: Number(e.target.value)})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-neon" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-1">分类</label>
                  <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-neon" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-1">标签 (逗号分隔)</label>
                  <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-neon" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 mb-2">演示图片 / 封面 (可选)</label>
                <ImageUploader value={formData.image} onChange={value => setFormData({...formData, image: value})} />
              </div>
              
              <div className="pt-4 border-t border-white/10 flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">取消</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-bg-dark font-bold bg-primary-neon hover:opacity-90 flex items-center gap-2 transition-opacity"><Save className="w-4 h-4" /> 保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
