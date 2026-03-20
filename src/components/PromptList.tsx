import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Terminal, 
  Copy, 
  Heart, 
  Star,
  Plus,
  ChevronRight,
  Loader2,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import { Page, Prompt } from '../types';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { EmptyState } from './EmptyState';

interface PromptListProps {
  onSelectPrompt: (prompt: Prompt) => void;
}

export const PromptList: React.FC<PromptListProps> = ({ onSelectPrompt }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [activeStyle, setActiveStyle] = useState('全部');
  const [sortBy, setSortBy] = useState('newest');
  const [displayCount, setDisplayCount] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const categories = ['全部', '插画设计', 'UI 界面', '摄影大片', '3D 渲染', '平面海报', 'Image Gen', 'LLM', 'Search'];
  const styles = ['全部', '科技感', '极简主义', '赛博朋克', '写实', '超 surreal', '复古'];

  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('prompts').select('*').order('sort_order', { ascending: true });
      if (error) {
        toast.error('获取提示词失败: ' + error.message);
      } else if (data) {
        const mappedData = data.map((p: any) => ({
          ...p,
          params: {
            model: p.model,
            sampler: p.sampler,
            steps: p.steps,
            cfg: p.cfg,
            seed: p.seed,
            size: p.size
          }
        }));
        setPrompts(mappedData);
      }
      setIsLoading(false);
    };
    fetchPrompts();
  }, []);

  const filteredPrompts = prompts
    .filter(prompt => {
      const categoryMatch = activeCategory === '全部' || prompt.category === activeCategory;
      const styleMatch = activeStyle === '全部' || (prompt.tags && prompt.tags.includes(activeStyle));
      const searchMatch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (prompt.description && prompt.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return categoryMatch && styleMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      if (sortBy === 'za') return b.title.localeCompare(a.title);
      return 0;
    });

  const visiblePrompts = filteredPrompts.slice(0, displayCount);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredPrompts.length && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [displayCount, filteredPrompts.length, isLoading]);

  const loadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + 8, filteredPrompts.length));
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-3xl font-headline font-bold text-white">探索 PROMPT </h2>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayCount(8);
              }}
              placeholder="搜索资源..."
              className="w-full bg-card-dark border border-transparent rounded-full py-3 pl-12 pr-4 text-sm text-white focus:ring-1 focus:ring-primary-neon focus:border-primary-neon outline-none transition-all"
            />
          </div>
          <div className="relative shrink-0">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setDisplayCount(8); }}
              className="appearance-none bg-card-dark border border-white/10 rounded-full py-3 pl-9 pr-4 text-xs text-white/60 focus:ring-1 focus:ring-primary-neon outline-none transition-all cursor-pointer hover:border-white/20"
            >
              <option value="newest">最新</option>
              <option value="rating">评分最高</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-white/40 whitespace-nowrap">类目:</span>
          <div className="flex gap-2 p-1 bg-white/5 rounded-full w-fit">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => {
                  setActiveCategory(cat);
                  setDisplayCount(8);
                }}
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors z-10 whitespace-nowrap ${
                  activeCategory === cat ? 'text-bg-dark' : 'text-white/40 hover:text-white'
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <motion.div 
                    layoutId="activePromptCategory"
                    className="absolute inset-0 bg-primary-neon rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-white/40 whitespace-nowrap">风格:</span>
          <div className="flex gap-2 p-1 bg-white/5 rounded-full w-fit">
            {styles.map(style => (
              <button 
                key={style} 
                onClick={() => setActiveStyle(style)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors z-10 whitespace-nowrap ${
                  activeStyle === style ? 'text-bg-dark' : 'text-white/40 hover:text-white'
                }`}
              >
                {style}
                {activeStyle === style && (
                  <motion.div 
                    layoutId="activePromptStyle"
                    className="absolute inset-0 bg-primary-neon rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && filteredPrompts.length === 0 && (
        <EmptyState
          title="未找到炼金配方"
          description="该分类或风格下暂无 Prompt，尝试重置筛选器或换个方向探索吧。"
          onReset={() => { setActiveCategory('全部'); setActiveStyle('全部'); setSearchQuery(''); }}
        />
      )}

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {visiblePrompts.map((prompt, idx) => (
          <motion.div
            key={prompt.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (idx % 8) * 0.05 }}
            className="break-inside-avoid group relative bg-card-dark rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:bg-card-high shadow-xl border border-white/5"
          >
            <div className="relative overflow-hidden">
              <img 
                src={prompt.image} 
                alt={prompt.title}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card-dark via-transparent to-transparent opacity-60"></div>
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded-full bg-card-high/80 backdrop-blur-md text-[10px] font-headline text-primary-neon">{prompt.category}</span>
                {prompt.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-blue-400/20 backdrop-blur-md text-[10px] font-headline text-blue-400">{tag}</span>
                ))}
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-white font-headline font-bold text-lg leading-tight mb-3 group-hover:text-primary-neon transition-colors">{prompt.title}</h3>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-primary-neon">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < (prompt.rating || 0) ? 'fill-primary-neon' : 'opacity-30'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-headline text-white/30">{prompt.rating?.toFixed(1)} 评分</span>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-white/5">
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(prompt.positive);
                      toast.success('提示词已复制');
                    }}
                    className="p-2 rounded-lg hover:bg-card-high transition-colors group/btn text-white/40 hover:text-primary-neon"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => toast.success('已加入收藏')}
                    className="p-2 rounded-lg hover:bg-card-high transition-colors group/btn text-white/40 hover:text-pink-400"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={() => onSelectPrompt(prompt)}
                  className="text-xs font-headline font-bold text-white/60 uppercase tracking-widest hover:bg-primary-neon hover:text-bg-dark px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                >
                  查看详情 <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Infinite Scroll Loader */}
      <div ref={loaderRef} className="py-12 flex justify-center">
        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary-neon animate-spin" />
            <span className="text-xs font-headline text-white/20 uppercase tracking-widest">加载更多资源...</span>
          </div>
        )}
        {!isLoading && displayCount >= filteredPrompts.length && filteredPrompts.length > 0 && (
          <p className="text-xs font-headline text-white/20 uppercase tracking-widest">已加载全部内容</p>
        )}
      </div>
    </div>
  );
};
