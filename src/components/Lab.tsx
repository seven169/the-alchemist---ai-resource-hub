import React, { useState } from 'react';
import { 
  FlaskConical, 
  Sparkles, 
  Image as ImageIcon, 
  Volume2, 
  Send,
  Loader2,
  Download,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateImage, generateSpeech } from '../services/ai';

export const Lab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'audio'>('image');
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultAudio, setResultAudio] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!prompt || isGenerating) return;
    setIsGenerating(true);
    setResultImage(null);
    try {
      const img = await generateImage(prompt, size);
      setResultImage(img);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!prompt || isGenerating) return;
    setIsGenerating(true);
    setResultAudio(null);
    try {
      const audio = await generateSpeech(prompt);
      setResultAudio(audio || null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="py-12 space-y-12 max-w-5xl mx-auto">
      <header className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-primary-neon/10 text-primary-neon mb-4">
          <FlaskConical className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-headline font-bold text-white tracking-tight">炼金实验室</h1>
        <p className="text-white/40 max-w-xl mx-auto font-light">
          利用 Gemini 尖端模型进行实时创作。生成高分辨率图像或自然语音。
        </p>
      </header>

      <div className="bg-card-dark rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="flex border-b border-white/5">
          <button 
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-6 font-headline font-bold text-sm flex items-center justify-center gap-3 transition-all ${
              activeTab === 'image' ? 'text-primary-neon bg-white/5' : 'text-white/30 hover:text-white/60'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            图像合成 (Nano Banana Pro)
          </button>
          <button 
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-6 font-headline font-bold text-sm flex items-center justify-center gap-3 transition-all ${
              activeTab === 'audio' ? 'text-primary-neon bg-white/5' : 'text-white/30 hover:text-white/60'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            语音炼制 (Gemini TTS)
          </button>
        </div>

        <div className="p-10 space-y-10">
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest ml-1">
                {activeTab === 'image' ? '提示词 Prompt' : '文本内容 Text'}
              </label>
              {activeTab === 'image' && (
                <div className="flex gap-2 p-1 bg-bg-dark rounded-lg">
                  {['1K', '2K', '4K'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s as any)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                        size === s ? 'bg-card-high text-primary-neon' : 'text-white/20 hover:text-white/40'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={activeTab === 'image' ? "描述你想要生成的画面..." : "输入想要转换成语音的文字..."}
              className="w-full h-32 bg-bg-dark border border-white/5 rounded-2xl p-6 text-white placeholder:text-white/10 focus:ring-1 focus:ring-primary-neon/30 transition-all resize-none"
            />

            <button 
              onClick={activeTab === 'image' ? handleGenerateImage : handleGenerateAudio}
              disabled={!prompt || isGenerating}
              className="w-full py-5 rounded-2xl bg-gradient-to-br from-white to-primary-neon text-bg-dark font-headline font-bold text-lg shadow-xl shadow-primary-neon/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  正在炼制中...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  开始合成
                </>
              )}
            </button>
          </div>

          {/* Result Area */}
          <AnimatePresence mode="wait">
            {(resultImage || resultAudio) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pt-10 border-t border-white/5 space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-headline font-bold text-white uppercase tracking-widest">合成结果 Result</h3>
                  <button 
                    onClick={() => activeTab === 'image' ? setResultImage(null) : setResultAudio(null)}
                    className="text-[10px] font-headline font-bold text-white/20 hover:text-red-400 transition-colors uppercase tracking-widest"
                  >
                    清除结果
                  </button>
                </div>

                {activeTab === 'image' && resultImage && (
                  <div className="group relative rounded-3xl overflow-hidden bg-bg-dark border border-white/5 aspect-square max-w-2xl mx-auto">
                    <img src={resultImage} alt="Generated" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button className="p-4 rounded-2xl bg-white text-bg-dark hover:scale-110 transition-transform">
                        <Download className="w-6 h-6" />
                      </button>
                      <button className="p-4 rounded-2xl bg-primary-neon text-bg-dark hover:scale-110 transition-transform">
                        <Maximize2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'audio' && resultAudio && (
                  <div className="p-8 rounded-3xl bg-bg-dark border border-white/5 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary-neon/10 flex items-center justify-center text-primary-neon">
                      <Volume2 className="w-8 h-8" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-primary-neon"></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-white/20">
                        <span>0:00</span>
                        <span>0:12</span>
                      </div>
                    </div>
                    <audio controls src={`data:audio/mpeg;base64,${resultAudio}`} className="hidden" id="lab-audio" />
                    <button 
                      onClick={() => (document.getElementById('lab-audio') as HTMLAudioElement)?.play()}
                      className="p-4 rounded-2xl bg-primary-neon text-bg-dark hover:scale-105 transition-transform"
                    >
                      <RefreshCw className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
