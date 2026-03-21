import React from 'react';
import { 
  Home, 
  Globe, 
  Terminal, 
  LayoutGrid, 
  Tag, 
  Plus, 
  FlaskConical,
  Settings
} from 'lucide-react';
import { Page } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onOpenModal: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, onOpenModal, isOpen, onClose }) => {
  const navItems = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'websites', label: '网站', icon: Globe },
    { id: 'prompts', label: 'PROMPT ', icon: Terminal },
    { id: 'cases', label: '案例', icon: LayoutGrid },
    { id: 'tags', label: '标签中心', icon: Tag },
  ];

  const handleLinkClick = (id: Page) => {
    onPageChange(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-bg-dark/60 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 bg-sidebar-dark flex flex-col py-8 px-4 border-r border-white/5 z-40 transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="px-4 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white to-primary-neon flex items-center justify-center shadow-lg shadow-primary-neon/20">
            <FlaskConical className="w-6 h-6 text-bg-dark" />
          </div>
          <div>
            <h1 className="text-primary-neon font-headline font-bold text-sm tracking-tight">Design Hub v1.0</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">合成智能</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleLinkClick(item.id as Page)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
              currentPage === item.id 
                ? "bg-card-high text-primary-neon shadow-[inset_0_0_10px_rgba(116,255,82,0.1)]" 
                : "text-white/40 hover:text-white hover:bg-white/5 hover:translate-x-1"
            )}
          >
            <item.icon className={cn("w-5 h-5", currentPage === item.id ? "text-primary-neon" : "text-white/40 group-hover:text-white")} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <button 
          onClick={() => { onOpenModal(); onClose(); }}
          className="w-full mb-6 py-3 px-4 rounded-xl bg-gradient-to-br from-white to-primary-neon text-bg-dark font-headline font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary-neon/20"
        >
          <Plus className="w-4 h-4" />
          新建资源
        </button>
        
        <div className="flex items-center gap-3 px-2 py-2 group cursor-pointer hover:bg-white/5 rounded-xl transition-colors">
          <div className="relative shrink-0">
            <img 
              src="https://picsum.photos/seed/alchemist-user/100/100" 
              alt="Avatar" 
              className="w-11 h-11 rounded-full object-cover border border-white/10"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-primary-neon rounded-full border-2 border-sidebar-dark"></div>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-headline font-bold text-white truncate">Ether Lab</span>
            <span className="text-[10px] text-white/40 font-medium truncate tracking-wide">Premium Member</span>
          </div>
          <button 
            onClick={() => handleLinkClick('admin')}
            className="p-2 text-white/20 hover:text-primary-neon transition-colors shrink-0"
            title="后台管理"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};
