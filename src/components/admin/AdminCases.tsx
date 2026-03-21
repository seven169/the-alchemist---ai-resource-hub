import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CaseStudy } from '../../types';
import { Trash2, Edit, Plus, X, Save, RefreshCw, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader } from './ImageUploader';

export const AdminCases: React.FC = () => {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    id: '', title: '', description: '', category: 'AIGC', tags: '', image: '', status: 'Completed'
  });

  const fetchCases = async () => {
    setIsLoading(true);
    // Note: To keep things simple in this MVP, we fetch cases without their logs.
    const { data, error } = await supabase.from('cases').select('*').order('sort_order', { ascending: true });
    if (error) toast.error('获取失败: ' + error.message);
    else if (data) setCases(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchCases(); }, []);

  const openForm = (caseStudy?: CaseStudy) => {
    if (caseStudy) {
      setEditingId(caseStudy.id);
      setFormData({
        id: caseStudy.id, title: caseStudy.title, description: caseStudy.description || '', category: caseStudy.category,
        tags: caseStudy.tags.join(', '), image: caseStudy.image || '', status: caseStudy.status || 'Completed'
      });
    } else {
      setEditingId(null);
      setFormData({
        id: `case-${Date.now()}`, title: '', description: '', category: 'AIGC', tags: '', image: '', status: 'Completed'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error('标题不能为空');

    const payload = {
      id: formData.id, title: formData.title, description: formData.description, category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean), image: formData.image, status: formData.status
    };

    if (editingId) {
      const { error } = await supabase.from('cases').update(payload).eq('id', editingId);
      if (error) return toast.error('更新失败: ' + error.message);
      toast.success('更新成功');
    } else {
      const { error } = await supabase.from('cases').insert([payload]);
      if (error) return toast.error('创建失败: ' + error.message);
      toast.success('创建成功');
    }
    setIsModalOpen(false);
    fetchCases();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除吗？该操作将同时删除关联的实验日志，且不可恢复。')) return;
    const { error } = await supabase.from('cases').delete().eq('id', id);
    if (error) toast.error('删除失败: ' + error.message);
    else { toast.success('删除成功'); setCases(cases.filter(w => w.id !== id)); }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newList = [...cases];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    const currentOrder = (newList[index] as any).sort_order ?? index;
    const targetOrder = (newList[targetIndex] as any).sort_order ?? targetIndex;
    const [errA, errB] = await Promise.all([
      supabase.from('cases').update({ sort_order: targetOrder }).eq('id', newList[index].id).then(r => r.error),
      supabase.from('cases').update({ sort_order: currentOrder }).eq('id', newList[targetIndex].id).then(r => r.error),
    ]);
    if (errA || errB) return toast.error('排序失败');
    toast.success('顺序已更新');
    fetchCases();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-headline font-bold text-white flex items-center gap-2">
            案例实验管理 ({cases.length})
          </h2>
          <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> 目前仅支持管理案例主信息，实验日志 (Logs) 数据请在 Supabase 后台数据库维护。
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchCases} className="p-2 text-white/50 hover:text-white bg-card-dark rounded-lg border border-white/10 transition-colors">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => openForm()} className="flex items-center gap-2 px-4 py-2 bg-primary-neon text-bg-dark font-bold rounded-lg hover:opacity-90 transition-opacity flex-shrink-0">
            <Plus className="w-5 h-5" /> 新增案例
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-bg-dark">
        <table className="w-full text-left text-sm text-white/60">
          <thead className="bg-white/5 text-white/40 uppercase font-headline tracking-widest text-xs">
            <tr>
              <th className="px-4 py-3 min-w-[200px]">封面 / 标題</th>
              <th className="px-4 py-3 min-w-[100px]">状态</th>
              <th className="px-4 py-3 min-w-[150px]">分类</th>
              <th className="px-4 py-3 min-w-[100px] text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {cases.map((item, idx) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={item.image || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-lg object-cover bg-card-high shrink-0" />
                    <div>
                      <p className="font-bold text-white truncate max-w-[200px]">{item.title}</p>
                      <p className="text-xs text-white/30 truncate max-w-[200px]">{item.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Completed' ? 'bg-primary-neon/10 text-primary-neon' : 'bg-amber-400/10 text-amber-400'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-white/5 rounded text-xs">{item.category}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="p-1.5 text-white/20 hover:text-white disabled:opacity-20 bg-white/5 hover:bg-white/10 rounded transition-colors"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleMove(idx, 'down')} disabled={idx === cases.length - 1} className="p-1.5 text-white/20 hover:text-white disabled:opacity-20 bg-white/5 hover:bg-white/10 rounded transition-colors"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={() => openForm(item)} className="p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-400/20 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {cases.length === 0 && !isLoading && (
              <tr><td colSpan={4} className="text-center py-10">暂无数据</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-card-dark rounded-2xl border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <h3 className="text-xl font-headline font-bold text-white">{editingId ? '编辑案例实验' : '新增案例实验'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1">ID *</label>
                <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={!!editingId} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1">标题 *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-neon" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1">描述</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-neon h-20 focus:outline-none" />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-1">实验状态</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-neon focus:outline-none appearance-none">
                    <option value="Completed">Completed (已完成)</option>
                    <option value="In Progress">In Progress (进行中)</option>
                    <option value="Draft">Draft (草稿)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-2">封面图片链接</label>
                  <ImageUploader value={formData.image} onChange={value => setFormData({...formData, image: value})} />
                </div>
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
