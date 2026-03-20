import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Globe, 
  Bookmark, 
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import { Resource } from '../types';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { EmptyState } from './EmptyState';

export const WebsiteList: React.FC = () => {
  const [websites, setWebsites] = useState<Resource[]>([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [activeScene, setActiveScene] = useState('全部');
  const [displayCount, setDisplayCount] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const categories = ['全部', 'UI 界面', '插画设计', '3D 渲染', '平面海报', '摄影大片', 'Image Gen', 'LLM', 'Search'];
  const scenes = ['全部', '活动页', '营销图', '弹窗', '插画'];

  useEffect(() => {
    const fetchWebsites = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('websites').select('*').order('sort_order', { ascending: true });
      if (error) {
        toast.error('获取网站失败: ' + error.message);
      } else if (data) {
        setWebsites(data);
      }
      setIsLoading(false);
    };
    fetchWebsites();
  }, []);

  const filteredWebsites = websites.filter(site => {
    const categoryMatch = activeCategory === '全部' || site.category === activeCategory;
    const sceneMatch = activeScene === '全部' || (site.tags && site.tags.includes(activeScene));
    const searchMatch = site.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (site.description && site.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && sceneMatch && searchMatch;
  });

  const visibleWebsites = filteredWebsites.slice(0, displayCount);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredWebsites.length && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [displayCount, filteredWebsites.length, isLoading]);

  const loadMore = () => {
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + 6, filteredWebsites.length));
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="py-12 space-y-8">
      {/* Filters */}
      <div className="pb-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-3xl font-headline font-bold text-white">探索 网站</h2>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayCount(6);
                }}
                placeholder="搜索资源..."
                className="w-full bg-card-dark border border-transparent rounded-full py-3 pl-12 pr-4 text-sm text-white focus:ring-1 focus:ring-primary-neon focus:border-primary-neon outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-primary-neon w-20 shrink-0">分类 Type:</span>
            <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-full w-fit">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => {
                    setActiveCategory(cat);
                    setDisplayCount(6);
                  }}
                  className={`relative px-4 py-1.5 rounded-full text-[11px] font-bold transition-colors z-10 ${
                    activeCategory === cat ? 'text-bg-dark' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {cat}
                  {activeCategory === cat && (
                    <motion.div 
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-primary-neon rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-primary-neon w-20 shrink-0">场景 Scene:</span>
            <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-full w-fit">
              {scenes.map(s => (
                <button 
                  key={s} 
                  onClick={() => setActiveScene(s)}
                  className={`relative px-4 py-1.5 rounded-full text-[11px] font-bold transition-colors z-10 ${
                    activeScene === s ? 'text-bg-dark' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {s}
                  {activeScene === s && (
                    <motion.div 
                      layoutId="activeScene"
                      className="absolute inset-0 bg-primary-neon rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && filteredWebsites.length === 0 && (
        <EmptyState
          title="炼金坩埚空了"
          description="当前分类或搜索词下没有匹配的网站资源，换个方向继续探索吧。"
          onReset={() => { setActiveCategory('全部'); setActiveScene('全部'); setSearchQuery(''); }}
        />
      )}

      {/* Waterfall Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {visibleWebsites.map((site, idx) => (
          <motion.div
            key={site.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (idx % 6) * 0.1 }}
            className="break-inside-avoid group bg-card-dark rounded-2xl overflow-hidden hover:bg-card-high transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-neon/5 border border-white/5 mb-8"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={site.image} 
                alt={site.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card-dark to-transparent opacity-60"></div>
              <div className="absolute top-4 right-4">
                <span className="bg-primary-neon/20 backdrop-blur-md text-primary-neon text-[10px] font-bold px-2 py-1 rounded border border-primary-neon/30 uppercase tracking-tighter">Verified</span>
              </div>
            </div>
            <div className="p-6 flex flex-col">
              <h4 className="text-xl font-headline font-bold text-white group-hover:text-primary-neon transition-colors">{site.title}</h4>
              <p className="text-sm text-white/40 mt-3 line-clamp-2 leading-relaxed font-light">{site.description}</p>
              
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-[10px] font-headline px-2 py-1 bg-card-high rounded-full text-white/60 border border-white/5">{site.category}</span>
                {site.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-headline px-2 py-1 bg-card-high rounded-full text-white/60 border border-white/5">{tag}</span>
                ))}
              </div>

              <div className="mt-8 pt-6 flex items-center justify-between gap-3 border-t border-white/5">
                <button 
                  onClick={() => {
                    if (site.url) {
                      window.open(site.url, '_blank');
                    } else {
                      toast.error('该资源暂无链接');
                    }
                  }}
                  className="flex-1 text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl border border-white/10 text-white/40 hover:bg-primary-neon hover:text-bg-dark transition-all"
                >
                  查看详情
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toast.success('已加入收藏')}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-dark text-white/40 hover:text-purple-400 transition-colors border border-white/5"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      if (site.url) {
                        navigator.clipboard.writeText(site.url);
                        toast.success('链接已复制到剪贴板');
                      } else {
                        toast.error('暂无链接');
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-dark text-white/40 hover:text-primary-neon transition-colors border border-white/5"
                  >
                    <LinkIcon className="w-5 h-5" />
                  </button>
                </div>
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
        {!isLoading && displayCount >= filteredWebsites.length && filteredWebsites.length > 0 && (
          <p className="text-xs font-headline text-white/20 uppercase tracking-widest">已加载全部内容</p>
        )}
      </div>
    </div>
  );
};
