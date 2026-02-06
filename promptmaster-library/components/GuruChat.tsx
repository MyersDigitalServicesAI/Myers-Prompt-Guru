import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User as UserIcon, Loader2, Sparkles } from 'lucide-react';
import { sendGuruMessage } from '../services/gemini';
import { ChatMessage } from '../types';

interface GuruChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuruChat: React.FC<GuruChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm your Prompt Engineering Guru. How can I help you refine your prompts today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    const currentMessages = [...messages, userMsg];

    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendGuruMessage(currentMessages);
      const modelText = response.text || "I apologize, I couldn't generate a response.";

      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (error) {
      console.error("Guru Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-out Panel */}
      <div className={`
        fixed top-0 right-0 bottom-0 w-full sm:w-[500px] glass z-50 shadow-[0_0_100px_rgba(0,0,0,0.5)] transform transition-transform duration-500 ease-in-out border-l border-white/10 flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg tracking-tight">Prompt Architect</h3>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Neural Link Active</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[85%] rounded-[1.5rem] px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user'
                  ? 'btn-primary text-white rounded-tr-none shadow-xl shadow-blue-500/10'
                  : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none font-medium'}
              `}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-[1.5rem] rounded-tl-none flex items-center gap-3">
                <div className="relative">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-purple-500 animate-pulse" />
                </div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Processing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 bg-black/20 border-t border-white/5">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Inject engineering query..."
              className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-sm text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 outline-none resize-none max-h-48 min-h-[60px] font-medium placeholder-slate-600 shadow-inner"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 bottom-3 p-3 btn-primary text-white rounded-xl disabled:opacity-30 disabled:grayscale transition-all shadow-lg active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[9px] font-bold text-center text-slate-600 mt-4 uppercase tracking-widest">
            AI Architectures may require human verification.
          </p>
        </div>
      </div>
    </>
  );
};