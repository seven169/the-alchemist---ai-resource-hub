import React from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Heart, 
  Share2, 
  Download,
  Image,
  Video,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import { Prompt } from '../types';
import { motion } from 'motion/react';

interface PromptDetailProps {
  prompt: Prompt;
  onBack: () => void;
}

export const PromptDetail: React.FC<PromptDetailProps> = ({ prompt, onBack }) => {

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="py-12 space-y-12"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-white/40 hover:text-primary-neon transition-colors font-headline text-xs uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Image & Actions */}
        <div className="space-y-8">
          <div className="rounded-3xl overflow-hidden bg-card-dark border border-white/5 shadow-2xl">
            <img src={prompt.image} alt={prompt.title} className="w-full h-auto" />
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => toast.info('正在准备下载...')}
              className="flex-1 py-4 rounded-xl bg-card-high text-white font-headline font-bold text-sm flex items-center justify-center gap-2 hover:bg-white hover:text-bg-dark transition-all border border-white/5"
            >
              <Download className="w-4 h-4" />
              下载原图
            </button>
            <button 
              onClick={() => toast.success('已加入收藏')}
              className="p-4 rounded-xl bg-card-high text-white/40 hover:text-pink-400 transition-all border border-white/5"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('分享链接已复制');
              }}
              className="p-4 rounded-xl bg-card-high text-white/40 hover:text-primary-neon transition-all border border-white/5"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Info & Prompt */}
        <div className="space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary-neon/10 text-primary-neon font-headline text-[10px] font-bold uppercase tracking-widest">{prompt.category}</span>
              <span className="text-white/20 text-xs font-headline">ID: {prompt.id}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-headline font-bold text-white leading-tight">{prompt.title}</h1>
            <p className="mt-4 text-white/40 text-sm md:text-lg font-light leading-relaxed">{prompt.description}</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-headline font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Image className="w-4 h-4 text-primary-neon" />
                图片提示词 Picture prompt
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(prompt.picture_prompt);
                    toast.success('正向提示词已复制');
                  }}
                  className="p-2 rounded-lg bg-card-high text-white/40 hover:text-primary-neon transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-card-dark border border-white/5 font-mono text-sm text-white/60 leading-relaxed">
              {prompt.picture_prompt}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-headline font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-400" />
                视频提示词 Video prompt
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(prompt.video_prompt);
                    toast.success('反向提示词已复制');
                  }}
                  className="p-2 rounded-lg bg-card-high text-white/40 hover:text-red-400 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-card-dark border border-white/5 font-mono text-sm text-white/60 leading-relaxed">
              {prompt.video_prompt}
            </div>
          </div>

        </div>
      </div>

      {/* FAQ Section */}
      <section className="pt-20 border-t border-white/5">
        <h2 className="text-2xl font-headline font-bold text-white mb-10 uppercase tracking-tight">常见问题 FAQ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { q: '如何获得最佳渲染效果？', a: '建议使用 DPM++ 2M Karras 采样器，并将步数设置在 30-40 之间。' },
            { q: '这个 Prompt 支持商业用途吗？', a: '是的，所有本站收录的 Prompt 均遵循 CC0 协议，可自由用于商业项目。' }
          ].map((faq, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-card-dark border border-white/5">
              <h4 className="text-white font-bold mb-3 flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-primary-neon/10 text-primary-neon flex items-center justify-center text-xs">Q</span>
                {faq.q}
              </h4>
              <p className="text-sm text-white/40 leading-relaxed pl-9">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
