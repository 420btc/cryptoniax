'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIChat } from '@/hooks/useAIChat';
import { Send, Loader2, Trash2, Sparkles, Swords } from 'lucide-react';

export default function BattleAIChat() {
  const { messages, isLoading, sendMessage, clearChat } = useAIChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(99,102,241,0.08)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white">IA de Batalla</span>
          <span className="text-[10px] text-[#5c5c80] bg-[rgba(99,102,241,0.1)] px-1.5 py-0.5 rounded">
            GPT-4o mini
          </span>
        </div>
        <button
          onClick={clearChat}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5c5c80] hover:text-[#ef4466] hover:bg-[rgba(239,68,102,0.1)] transition"
          title="Reiniciar chat"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white rounded-br-md'
                    : 'glass text-[#d0d0e0] rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Swords size={10} className="text-[#818cf8]" />
                    <span className="text-[10px] text-[#818cf8] font-medium">IA</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="glass px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
              <Loader2 size={14} className="text-[#818cf8] animate-spin" />
              <span className="text-xs text-[#8888b0]">Consultando el oráculo...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[rgba(99,102,241,0.08)]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre tus trades, estrategia, o el reino..."
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.1)] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-[#5c5c80] resize-none focus:outline-none focus:border-[rgba(99,102,241,0.3)] transition disabled:opacity-50"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition shadow-lg shadow-[#6366f1]/20"
          >
            <Send size={16} className="text-white" />
          </motion.button>
        </div>
        <p className="text-[10px] text-[#3c3c60] mt-1.5 text-center">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}
