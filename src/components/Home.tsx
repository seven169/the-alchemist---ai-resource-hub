import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ArrowRight, 
  Globe, 
  Terminal, 
  LayoutGrid, 
  Tag,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Page } from '../types';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface HomeProps {
  onPageChange: (page: Page) => void;
  onGlobalSearch: (query: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onPageChange, onGlobalSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const categories = [
    { id: 'websites', label: '网站', desc: '收录 5000+ 精选 AI 站点', icon: Globe, color: 'text-primary-neon', bg: 'bg-primary-neon/10' },
    { id: 'prompts', label: 'PROMPT ', desc: '高级指令集与参数优化', icon: Terminal, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'cases', label: '案例', desc: '商业实战工作流拆解', icon: LayoutGrid, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'tags', label: '标签中心', desc: '多维度行业分类导航', icon: Tag, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  const updates = [
    { title: '新增网址: Sora Web AI 视频编辑器', time: '2 小时前', type: 'NEW', color: 'bg-primary-neon' },
    { title: 'Prompt 更新: 工业产品 3D 渲染模板 v2', time: '5 小时前', type: 'UPDATE', color: 'bg-blue-400' },
    { title: '新增案例: 电商背景替换全自动化流', time: '10 小时前', type: 'DOC', color: 'bg-purple-400' },
  ];

  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-primary-neon/5 rounded-full blur-[120px] -z-10 h-[300px] w-full max-w-4xl mx-auto"></div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-white mb-6"
        >
          探索 <span className="text-primary-neon neon-text-glow">数字炼金</span> 的终极资源
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-white/60 max-w-2xl mb-12 font-light leading-relaxed"
        >
          汇集全球最顶尖的 AI 网址、Prompt 精选及实战案例，为你的创造力注入合成能源。
        </motion.p>

          <div className="w-full max-w-2xl relative group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  onGlobalSearch(searchQuery.trim());
                }
              }}
              placeholder="搜索你需要的 AI 工具或 Prompt..."
              className="w-full bg-card-dark/80 backdrop-blur-xl px-8 py-5 rounded-2xl border border-white/5 text-xl focus:ring-1 focus:ring-primary-neon focus:border-primary-neon focus:bg-card-high transition-all font-light shadow-2xl outline-none text-white"
            />
          <button 
            onClick={() => {
              if (searchQuery.trim()) {
                onGlobalSearch(searchQuery.trim());
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-br from-white to-primary-neon text-bg-dark px-6 py-2.5 rounded-xl font-bold font-headline flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-primary-neon/20"
          >
            <Search className="w-5 h-5" />
            <span>搜索</span>
          </button>
        </div>

        <div className="flex gap-4 mt-8 flex-wrap justify-center">
          <span className="text-xs font-headline uppercase tracking-widest text-white/30 pt-1">热门关键词:</span>
          {['#Midjourney', '#GPT-4V', '#Sora 提示词', '#工作流'].map(tag => (
            <button 
              key={tag} 
              onClick={() => onGlobalSearch(tag.replace('#', '').trim())}
              className="px-3 py-1 bg-card-high rounded-full text-xs text-white/50 hover:text-primary-neon transition-colors border border-white/5 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Bento Grid Categories */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 + 0.2 }}
            onClick={() => onPageChange(cat.id as Page)}
            className="group relative overflow-hidden aspect-square bg-card-dark rounded-2xl p-8 flex flex-col justify-end transition-all duration-300 hover:bg-card-high hover:-translate-y-1 border border-white/5"
          >
            <div className={`absolute top-8 left-8 p-3 rounded-xl ${cat.bg} ${cat.color}`}>
              <cat.icon className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-headline font-bold text-white mb-2">{cat.label}</h3>
              <p className="text-sm text-white/40 font-light">{cat.desc}</p>
            </div>
            <div className={`absolute top-0 right-0 w-32 h-32 ${cat.bg} rounded-full blur-3xl -mr-10 -mt-10 group-hover:opacity-100 opacity-0 transition-opacity`}></div>
          </motion.button>
        ))}
      </section>

      {/* Recent Updates & Featured */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-tight">最近更新</h2>
              <p className="text-sm text-white/40 mt-1">实验室同步每日 AI 动向</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {updates.map((update, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:bg-card-dark transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                <div className={`w-2 h-2 rounded-full ${update.color}`}></div>
                <div className="flex-1">
                  <h5 className="text-white font-medium text-sm">{update.title}</h5>
                  <p className="text-xs text-white/30 flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3" />
                    {update.time}
                  </p>
                </div>
                <span className="text-[10px] font-headline font-bold text-white/20 group-hover:text-primary-neon transition-colors tracking-widest">{update.type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card-dark/50 rounded-2xl p-8 border border-white/5 relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[10px] font-headline font-bold text-primary-neon bg-primary-neon/10 px-2 py-1 rounded uppercase tracking-widest">精选案例</span>
            <h3 className="text-2xl font-headline font-bold text-white mt-6 mb-4 leading-tight">AI 辅助品牌全链路视觉生成</h3>
            <p className="text-sm text-white/40 mb-8 leading-relaxed">探索如何利用 Stable Diffusion 与 ControlNet 在 48 小时内完成整套品牌视觉输出。</p>
            <button 
              onClick={() => onPageChange('case-detail')}
              className="inline-flex items-center gap-2 text-primary-neon font-bold group"
            >
              阅读详情 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="absolute bottom-[-20%] right-[-10%] w-48 h-48 bg-primary-neon/5 rounded-full blur-3xl group-hover:bg-primary-neon/10 transition-colors"></div>
        </div>
      </section>
    </div>
  );
};
