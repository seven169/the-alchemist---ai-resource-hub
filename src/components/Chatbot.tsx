import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  Sparkles,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { startChat } from '../services/ai';
import ReactMarkdown from 'react-markdown';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: '你好，我是 Alchemist 炼金助手。有什么我可以帮你的吗？' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      let currentChat = chat;
      if (!currentChat) {
        currentChat = await startChat();
        setChat(currentChat);
      }

      const response = await currentChat.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '抱歉，我没听清。' }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: '连接实验室超时，请稍后再试。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-primary-neon text-bg-dark shadow-2xl shadow-primary-neon/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-bg-dark"></div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-28 right-8 w-[400px] h-[600px] bg-card-dark border border-white/10 rounded-[32px] shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-neon/10 text-primary-neon flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-headline font-bold text-sm">Alchemist AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-neon animate-pulse"></div>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">在线调试中</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsOpen(false)} className="p-2 text-white/20 hover:text-white transition-colors">
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-white/20 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary-neon text-bg-dark font-medium rounded-tr-none' 
                      : 'bg-card-high text-white/80 rounded-tl-none border border-white/5'
                  }`}>
                    <div className="markdown-body">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card-high p-4 rounded-2xl rounded-tl-none border border-white/5">
                    <Loader2 className="w-5 h-5 text-primary-neon animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-white/5 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="询问任何关于 AI 的问题..."
                  className="w-full bg-bg-dark border border-white/5 rounded-xl py-4 pl-6 pr-14 text-sm text-white focus:ring-1 focus:ring-primary-neon/30 transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-primary-neon text-bg-dark flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
