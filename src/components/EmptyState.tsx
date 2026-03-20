import React from 'react';
import { motion } from 'motion/react';
import { FlaskConical, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '炼金坩埚空了',
  description = '当前的筛选条件下没有找到任何资源，换个方向探索吧。',
  onReset,
  resetLabel = '重置筛选器',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-32 px-6 text-center"
    >
      {/* Animated icon glow */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-primary-neon/20 blur-2xl scale-150 animate-pulse" />
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-card-dark border border-primary-neon/20">
          <FlaskConical className="w-10 h-10 text-primary-neon/60" strokeWidth={1.5} />
        </div>
      </div>

      {/* Decorative scanline */}
      <div className="flex items-center gap-4 mb-6 w-full max-w-xs">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary-neon/30" />
        <span className="text-[9px] font-headline tracking-[0.3em] text-primary-neon/40 uppercase whitespace-nowrap">
          No Results
        </span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary-neon/30" />
      </div>

      <h3 className="text-2xl font-headline font-bold text-white mb-3">{title}</h3>
      <p className="text-sm text-white/30 leading-relaxed max-w-sm font-light">{description}</p>

      {onReset && (
        <button
          onClick={onReset}
          className="mt-8 flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/40 hover:border-primary-neon/40 hover:text-primary-neon transition-all text-sm font-bold"
        >
          <RotateCcw className="w-4 h-4" />
          {resetLabel}
        </button>
      )}
    </motion.div>
  );
};
