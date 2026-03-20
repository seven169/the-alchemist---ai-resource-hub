import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Resource, Prompt, CaseStudy } from '../types';
import { Search, Globe, Terminal, FlaskConical, ArrowRight } from 'lucide-react';

interface SearchResultsProps {
  query: string;
  onSelectPrompt: (prompt: Prompt) => void;
  onSelectCase: (caseStudy: CaseStudy) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ query, onSelectPrompt, onSelectCase }) => {
  const [websites, setWebsites] = useState<Resource[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setWebsites([]);
        setPrompts([]);
        setCases([]);
        return;
      }
      setIsLoading(true);
      
      const searchStr = `%${query}%`;
      
      const [webRes, promptRes, caseRes] = await Promise.all([
        supabase.from('websites').select('*').or(`title.ilike.${searchStr},description.ilike.${searchStr}`),
        supabase.from('prompts').select('*').or(`title.ilike.${searchStr},description.ilike.${searchStr}`),
        supabase.from('cases').select('*, logs:cases_logs(*)').or(`title.ilike.${searchStr},description.ilike.${searchStr}`)
      ]);

      if (webRes.data) setWebsites(webRes.data);
      if (promptRes.data) {
        const mappedData = promptRes.data.map((p: any) => ({
          ...p,
          params: { model: p.model, sampler: p.sampler, steps: p.steps, cfg: p.cfg, seed: p.seed, size: p.size }
        }));
        setPrompts(mappedData);
      }
      if (caseRes.data) setCases(caseRes.data);
      
      setIsLoading(false);
    };
    
    fetchResults();
  }, [query]);

  const totalResults = websites.length + prompts.length + cases.length;

  return (
    <div className="py-12 animate-fade-in space-y-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-headline font-bold text-white tracking-tight flex items-center gap-4">
          <Search className="w-10 h-10 text-primary-neon" />
          搜索结果
        </h1>
        <p className="text-white/40">关于 "{query}" 的全局搜索内容，共找到 {totalResults} 个结果</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-primary-neon border-t-transparent rounded-full animate-spin" />
        </div>
      ) : totalResults === 0 ? (
        <div className="py-20 text-center">
          <p className="text-white/40 text-lg">没有找到相关资源，请换个关键词试试</p>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Websites */}
          {websites.length > 0 && (
            <section>
              <h2 className="text-2xl font-headline font-bold text-white flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-primary-neon" /> 网址导航 ({websites.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {websites.map(site => (
                  <div key={site.id} className="p-6 rounded-2xl bg-card-dark border border-white/5 hover:border-primary-neon/50 transition-all cursor-pointer group" onClick={() => site.url && window.open(site.url, '_blank')}>
                    <div className="flex items-center gap-4 mb-4">
                      {site.image && <img src={site.image} alt={site.title} className="w-12 h-12 rounded-xl object-cover" />}
                      <div>
                        <h3 className="text-white font-bold">{site.title}</h3>
                        <span className="text-xs text-primary-neon bg-primary-neon/10 px-2 py-1 rounded-md">{site.category}</span>
                      </div>
                    </div>
                    <p className="text-sm text-white/50 line-clamp-2">{site.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Prompts */}
          {prompts.length > 0 && (
            <section>
              <h2 className="text-2xl font-headline font-bold text-white flex items-center gap-3 mb-6">
                <Terminal className="w-6 h-6 text-primary-neon" /> 提示词库 ({prompts.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prompts.map(prompt => (
                  <div key={prompt.id} className="p-6 rounded-2xl bg-card-dark border border-white/5 hover:border-primary-neon/50 transition-all cursor-pointer group" onClick={() => onSelectPrompt(prompt)}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-white font-bold text-lg">{prompt.title}</h3>
                      <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-primary-neon transition-colors" />
                    </div>
                    <p className="text-sm text-white/50 line-clamp-2">{prompt.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Cases */}
          {cases.length > 0 && (
            <section>
              <h2 className="text-2xl font-headline font-bold text-white flex items-center gap-3 mb-6">
                <FlaskConical className="w-6 h-6 text-primary-neon" /> 案例实验 ({cases.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cases.map(item => (
                  <div key={item.id} className="p-6 rounded-2xl bg-card-dark border border-white/5 hover:border-primary-neon/50 transition-all cursor-pointer group" onClick={() => onSelectCase(item)}>
                     <div className="relative h-48 rounded-xl overflow-hidden mb-6">
                        {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <h3 className="text-xl font-bold text-white">{item.title}</h3>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
