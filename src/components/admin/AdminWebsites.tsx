import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Resource } from '../../types';
import { Trash2, Edit, Plus, X, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader } from './ImageUploader';

export const AdminWebsites: React.FC = () => {
  const [websites, setWebsites] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    id: '', title: '', description: '', category: 'UI 界面', tags: '', image: '', url: ''
  });

  const fetchWebsites = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('websites').select('*').order('created_at', { ascending: false });
    if (error) toast.error('获取失败: ' + error.message);
    else if (data) setWebsites(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const openForm = (website?: Resource) => {
    if (website) {
      setEditingId(website.id);
      setFormData({
        id: website.id,
        title: website.title,
        description: website.description || '',
        category: website.category,
        tags: website.tags.join(', '),
        image: website.image || '',
        url: website.url || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        id: `site-${Date.now()}`,
        title: '', description: '', category: 'UI 界面', tags: '', image: '', url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error('标题不能为空');

    const payload = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      image: formData.image,
      url: formData.url
    };

    if (editingId) {
      const { error } = await supabase.from('websites').update(payload).eq('id', editingId);
      if (error) return toast.error('更名失败: ' + error.message);
      toast.success('更新成功');
    } else {
      const { error } = await supabase.from('websites').insert([payload]);
      if (error) return toast.error('创建失败: ' + error.message);
      toast.success('创建成功');
    }
    setIsModalOpen(false);
    fetchWebsites();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除吗？该操作不可恢复。')) return;
    const { error } = await supabase.from('websites').delete().eq('id', id);
    if (error) toast.error('删除失败: ' + error.message);
    else {
      toast.success('删除成功');
      setWebsites(websites.filter(w => w.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-headline font-bold text-white">网址大全管理 ({websites.length})</h2>
        <div className="flex gap-4">
          <button onClick={fetchWebsites} className="p-2 text-white/50 hover:text-white bg-card-dark rounded-lg border border-white/10 transition-colors">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => openForm()} className="flex items-center gap-2 px-4 py-2 bg-primary-neon text-bg-dark font-bold rounded-lg hover:opacity-90 transition-opacity flex-shrink-0">
            <Plus className="w-5 h-5" /> 新增网址
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-bg-dark">
        <table className="w-full text-left text-sm text-white/60">
          <thead className="bg-white/5 text-white/40 uppercase font-headline tracking-widest text-xs">
            <tr>
              <th className="px-4 py-3 min-w-[200px]">封面 / 标题</th>
              <th className="px-4 py-3 min-w-[100px]">分类</th>
              <th className="px-4 py-3 min-w-[200px]">链接</th>
              <th className="px-4 py-3 min-w-[100px] text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {websites.map(site => (
              <tr key={site.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={site.image || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-lg object-cover bg-card-high shrink-0" />
                    <div>
                      <p className="font-bold text-white truncate max-w-[150px]">{site.title}</p>
                      <p className="text-xs text-white/30 truncate max-w-[150px]">{site.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-white/5 rounded text-xs truncate max-w-[100px] inline-block">{site.category}</span></td>
                <td className="px-4 py-3">
                  {site.url ? <a href={site.url} target="_blank" rel="noreferrer" className="text-primary-neon hover:underline truncate max-w-[150px] inline-block">{site.url}</a> : '无'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openForm(site)} className="p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(site.id)} className="p-1.5 text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-400/20 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {websites.length === 0 && !isLoading && (
              <tr><td colSpan={4} className="text-center py-10">暂无数据</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-card-dark rounded-2xl border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <h3 className="text-xl font-headline font-bold text-white">{editingId ? '编辑网址' : '新增网址'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1">ID (唯一标识)</label>
                <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={!!editingId} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1">标题 *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-neon focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1">描述</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-neon h-20 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-1">分类</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-neon focus:outline-none appearance-none">
                    <option>UI 界面</option>
                    <option>插画设计</option>
                    <option>3D 渲染</option>
                    <option>平面海报</option>
                    <option>摄影大片</option>
                    <option>Image Gen</option>
                    <option>LLM</option>
                    <option>Search</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-1">标签 (用逗号分隔)</label>
                  <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-neon focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-2">封面图片链接</label>
                <ImageUploader value={formData.image} onChange={url => setFormData({...formData, image: url})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1">目标跳转链接</label>
                <input type="text" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-neon focus:outline-none" placeholder="https://..." />
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
