import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, LogOut, Globe, Terminal, FlaskConical } from 'lucide-react';
import { AdminWebsites } from './AdminWebsites';
import { AdminPrompts } from './AdminPrompts';
import { AdminCases } from './AdminCases';

interface AdminDashboardProps {
  onExit: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'websites' | 'prompts' | 'cases'>('websites');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (password === adminPass) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('密码错误，想成为大炼金术士再练练吧');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-32">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card-dark p-8 rounded-2xl border border-white/10 w-full max-w-sm shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-neon/10 rounded-full text-primary-neon">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-headline font-bold text-white text-center mb-6">管理员访问</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="在此输入结界密码..." 
                className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-neon outline-none focus:ring-1 focus:ring-primary-neon transition-all" 
              />
              {error && <p className="text-red-400 text-xs mt-2 font-bold">{error}</p>}
            </div>
            <div className="space-y-3 pt-2">
              <button type="submit" className="w-full bg-primary-neon text-bg-dark font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex justify-center uppercase tracking-widest text-sm shadow-xl shadow-primary-neon/20">
                进入结界
              </button>
              <button type="button" onClick={onExit} className="w-full bg-white/5 text-white/50 font-bold py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all flex justify-center uppercase tracking-widest text-sm">
                返回前台
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 animate-fade-in relative z-10">
      <div className="flex justify-between items-center bg-card-dark/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-neon/10 rounded-xl text-primary-neon">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold text-white">后台中枢系统</h1>
            <p className="text-xs text-white/50 uppercase tracking-widest">Administrator Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors font-bold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4" /> 锁定后台
          </button>
          <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 hover:text-white transition-colors font-bold text-xs uppercase tracking-wider">
            <LogOut className="w-4 h-4" /> 返回前台
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('websites')} className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'websites' ? 'bg-card-high text-primary-neon border border-white/10' : 'text-white/50 hover:text-white hover:bg-card-dark'}`}>
          <Globe className="w-4 h-4" /> 网址大全
        </button>
        <button onClick={() => setActiveTab('prompts')} className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'prompts' ? 'bg-card-high text-primary-neon border border-white/10' : 'text-white/50 hover:text-white hover:bg-card-dark'}`}>
          <Terminal className="w-4 h-4" /> 提示词库
        </button>
        <button onClick={() => setActiveTab('cases')} className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'cases' ? 'bg-card-high text-primary-neon border border-white/10' : 'text-white/50 hover:text-white hover:bg-card-dark'}`}>
          <FlaskConical className="w-4 h-4" /> 案例实验
        </button>
      </div>

      <div className="bg-card-dark/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 min-h-[500px] shadow-2xl">
        {activeTab === 'websites' && <AdminWebsites />}
        {activeTab === 'prompts' && <AdminPrompts />}
        {activeTab === 'cases' && <AdminCases />}
      </div>
    </div>
  );
};
