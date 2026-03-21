import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Home } from './components/Home';
import { WebsiteList } from './components/WebsiteList';
import { PromptList } from './components/PromptList';
import { CaseStudyList } from './components/CaseStudyList';
import { PromptDetail } from './components/PromptDetail';
import { CaseStudyDetail } from './components/CaseStudyDetail';
import { SearchResults } from './components/SearchResults';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AddResourceModal } from './components/AddResourceModal';
import { ScrollToTop } from './components/ScrollToTop';
import { Toaster } from 'sonner';
import { Page, Prompt, CaseStudy } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    setSelectedPrompt(null);
    setSelectedCase(null);
  };

  const handleGlobalSearch = (query: string) => {
    setGlobalSearchQuery(query);
    setCurrentPage('search');
  };

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setCurrentPage('prompt-detail');
  };

  const handleSelectCase = (caseStudy: CaseStudy) => {
    setSelectedCase(caseStudy);
    setCurrentPage('case-detail');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onPageChange={handlePageChange} onGlobalSearch={handleGlobalSearch} />;
      case 'search':
        return <SearchResults query={globalSearchQuery} onSelectPrompt={handleSelectPrompt} onSelectCase={handleSelectCase} />;
      case 'websites':
        return <WebsiteList />;
      case 'prompts':
        return <PromptList onSelectPrompt={handleSelectPrompt} />;
      case 'cases':
        return <CaseStudyList onSelectCase={handleSelectCase} />;
      case 'prompt-detail':
        return selectedPrompt ? (
          <PromptDetail prompt={selectedPrompt} onBack={() => setCurrentPage('prompts')} />
        ) : <Home onPageChange={handlePageChange} onGlobalSearch={handleGlobalSearch} />;
      case 'case-detail':
        return selectedCase ? (
          <CaseStudyDetail caseStudy={selectedCase} onBack={() => setCurrentPage('cases')} />
        ) : <Home onPageChange={handlePageChange} onGlobalSearch={handleGlobalSearch} />;
      case 'tags':
        return (
          <div className="py-24 text-center space-y-6">
            <h2 className="text-4xl font-headline font-bold text-white">标签中心</h2>
            <p className="text-white/40">正在构建多维度行业分类导航系统...</p>
          </div>
        );

      default:
        return <Home onPageChange={handlePageChange} onGlobalSearch={handleGlobalSearch} />;
    }
  };

  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-bg-dark font-sans text-white">
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary-neon/5 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]"></div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key="admin-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 max-w-7xl mx-auto px-8 py-12"
          >
            <AdminDashboard onExit={() => handlePageChange('home')} />
          </motion.div>
        </AnimatePresence>
        <Toaster position="top-center" expand={false} richColors theme="dark" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar-dark border-b border-white/5 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white to-primary-neon flex items-center justify-center">
            <span className="text-bg-dark font-bold text-xs">DH</span>
          </div>
          <h1 className="text-primary-neon font-headline font-bold text-xs tracking-tight">Design Hub</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-white/60 hover:text-white"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <Sidebar 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
        onOpenModal={() => setIsModalOpen(true)} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 md:ml-64 min-h-screen relative pt-16 md:pt-0">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary-neon/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AddResourceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ScrollToTop />
      <Toaster position="top-center" expand={false} richColors theme="dark" />
    </div>
  );
};

export default App;
