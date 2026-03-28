import React from 'react';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Maximize2,
  Share2,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { CaseStudy } from '../types';
import { motion } from 'motion/react';

interface CaseStudyDetailProps {
  caseStudy: CaseStudy;
  onBack: () => void;
}

export const CaseStudyDetail: React.FC<CaseStudyDetailProps> = ({ caseStudy, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12 space-y-16"
    >
      <header className="space-y-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-primary-neon transition-colors font-headline text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          返回案例
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 rounded bg-primary-neon/10 text-primary-neon font-headline text-[10px] font-bold uppercase tracking-widest">Case Study</span>
              <span className="flex items-center gap-2 text-primary-neon font-headline text-[10px] font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3" />
                {caseStudy.status}
              </span>
            </div>
            <h1 className="text-4xl md:text-7xl font-headline font-black tracking-tighter text-white leading-none mb-8">
              {caseStudy.title}
            </h1>
            <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed">
              {caseStudy.description}
            </p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => toast.success('已加入收藏')}
              className="p-4 rounded-2xl bg-card-dark text-white/40 hover:text-white transition-all border border-white/5"
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('分享链接已复制');
              }}
              className="p-4 rounded-2xl bg-card-dark text-white/40 hover:text-white transition-all border border-white/5"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left: Logs & Steps */}
        <div className="lg:col-span-8 space-y-12">
          <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <Clock className="w-6 h-6 text-primary-neon" />
            炼金日志 LOGS
          </h2>

          <div className="space-y-16 relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-white/5">
            {caseStudy.logs.map((log, idx) => (
              <div key={log.id} className="relative pl-12">
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-bg-dark border-2 border-primary-neon flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-neon"></div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-headline font-bold text-white">{log.title}</h4>
                    <span className="text-[10px] font-mono text-white/20">{log.time}</span>
                  </div>
                  <p className="text-white/40 font-light leading-relaxed">{log.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sidebar Info */}
        <div className="lg:col-span-4 space-y-12">
          <div className="p-8 rounded-3xl bg-card-dark border border-white/5 space-y-8">
            <h3 className="text-sm font-headline font-bold text-white uppercase tracking-widest">核心结论 Takeaways</h3>
            <ul className="space-y-6">
              {[
                'ControlNet 的 Canny 模型在保持产品轮廓方面表现最佳。',
                '提示词中加入 "volumetric lighting" 能显著提升画面的深度感。',
                '后期使用 Topaz AI 进行 4x 放大是商业交付的必要步骤。'
              ].map((item, i) => (
                <li key={i} className="flex gap-4 text-sm text-white/60 leading-relaxed">
                  <Sparkles className="w-5 h-5 text-primary-neon shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-primary-neon text-bg-dark space-y-6">
            <h3 className="text-sm font-headline font-bold uppercase tracking-widest">尝试此工作流</h3>
            <p className="text-sm font-medium leading-relaxed">
              我们已经将此案例中使用的所有 Prompt 和参数打包。点击下方按钮即可一键导入你的实验室。
            </p>
            <button 
              onClick={() => toast.success('工作流已成功导入实验室')}
              className="w-full py-4 rounded-xl bg-bg-dark text-white font-headline font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
              导入工作流
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
