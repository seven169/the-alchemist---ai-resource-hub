import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ArrowRight, 
  Plus,
  ChevronRight,
  Sparkles,
  Loader2,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import { Page, CaseStudy } from '../types';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { EmptyState } from './EmptyState';

interface CaseStudyListProps {
  onSelectCase: (caseStudy: CaseStudy) => void;
}

export const CaseStudyList: React.FC<CaseStudyListProps> = ({ onSelectCase }) => {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [activeCategory, setActiveCategory] = useState('所有项目');
  const [sortBy, setSortBy] = useState('newest');
  const [displayCount, setDisplayCount] = useState(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const categories = ['所有项目', 'AIGC', 'UI设计', '插画', '品牌', '动态图形', '神经网络艺术'];

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('cases').select(`
        *,
        logs:cases_logs(*)
      `);
      if (error) {
        toast.error('获取案例失败: ' + error.message);
      } else if (data) {
        setCases(data);
      }
      setIsLoading(false);
    };
    fetchCases();
  }, []);

  const filteredCases = cases
    .filter(item => {
      const categoryMatch = activeCategory === '所有项目' || item.category === activeCategory;
      const searchMatch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return categoryMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      if (sortBy === 'za') return b.title.localeCompare(a.title);
      if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
      return 0;
    });

  const visibleCases = filteredCases.slice(0, displayCount);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredCases.length && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [displayCount, filteredCases.length, isLoading]);

  const loadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + 4, filteredCases.length));
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="py-12 space-y-8">
      <div className="pb-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-3xl font-headline font-bold text-white">探索 案例</h2>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayCount(4);
                }}
                placeholder="搜索实验..."
                className="w-full bg-card-dark border border-transparent rounded-full py-3 pl-12 pr-4 text-sm text-white focus:ring-1 focus:ring-primary-neon focus:border-primary-neon outline-none transition-all"
              />
            </div>
            <div className="relative shrink-0">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
              <select
                value={sortBy}
                onChange={e => { setSortBy(e.target.value); setDisplayCount(4); }}
                className="appearance-none bg-card-dark border border-white/10 rounded-full py-3 pl-9 pr-4 text-xs text-white/60 focus:ring-1 focus:ring-primary-neon outline-none transition-all cursor-pointer hover:border-white/20"
              >
                <option value="newest">最新</option>
                <option value="status">按状态</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-primary-neon w-20 shrink-0">筛选 Filter:</span>
          <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-full w-fit">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => {
                  setActiveCategory(cat);
                  setDisplayCount(4);
                }}
                className={`relative px-4 py-1.5 rounded-full text-[11px] font-bold transition-colors z-10 ${
                  activeCategory === cat ? 'text-bg-dark' : 'text-white/40 hover:text-white'
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <motion.div 
                    layoutId="activeCaseCategory"
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
      {!isLoading && filteredCases.length === 0 && (
        <EmptyState
          title="实验室记录为空"
          description="该分类下暂无案例实验，可以尝试重置筛选，或通过后台录入新的案例。"
          onReset={() => { setActiveCategory('所有项目'); setSearchQuery(''); }}
        />
      )}

      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {visibleCases.map((item, idx) => (
          <motion.article 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (idx % 4) * 0.1 }}
            onClick={() => onSelectCase(item)}
            className="break-inside-avoid group overflow-hidden rounded-2xl bg-card-dark transition-all hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-primary-neon/5 border border-white/5 cursor-pointer mb-8"
          >
            <div className="relative overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card-dark/60 to-transparent"></div>
              {idx === 0 && activeCategory === '所有项目' && (
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 rounded-full bg-blue-500/80 backdrop-blur-md text-white font-headline text-[10px] font-bold tracking-widest uppercase">推荐发布</span>
                </div>
              )}
            </div>
            <div className="p-8">
              <span className="text-white/40 font-headline text-[10px] tracking-widest uppercase mb-3 block">{item.category}</span>
              <h3 className="text-2xl font-headline font-bold text-white mb-4 group-hover:text-primary-neon transition-colors">{item.title}</h3>
              <p className="text-sm text-white/40 line-clamp-2 leading-relaxed font-light">
                {item.description}
              </p>
              <div className="mt-6 pt-6 border-t border-white/5">
                <button className="group/btn flex items-center gap-2 text-primary-neon font-bold text-sm hover:bg-primary-neon hover:text-bg-dark px-4 py-2 rounded-xl transition-all">
                  查看详情 
                  <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Infinite Scroll Loader */}
      <div ref={loaderRef} className="py-12 flex justify-center">
        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary-neon animate-spin" />
            <span className="text-xs font-headline text-white/20 uppercase tracking-widest">加载更多实验...</span>
          </div>
        )}
        {!isLoading && displayCount >= filteredCases.length && filteredCases.length > 0 && (
          <p className="text-xs font-headline text-white/20 uppercase tracking-widest">已加载全部内容</p>
        )}
      </div>
    </div>
  );
};
