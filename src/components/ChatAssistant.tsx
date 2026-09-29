import React, { useState, useRef, useEffect } from 'react';
import { TripSearchParams } from '../types/travel';
import { Bot, Send, X, Sparkles, User, RefreshCw, ChevronDown, MessageSquare } from 'lucide-react';

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  tripContext: TripSearchParams;
}

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Optimize my budget to save ₹15,000',
  'Suggest top vegetarian eateries near attractions',
  'What are the visa & forex rules for Indian passport holders?',
  'Recommend local public transit passes',
  'Suggest safety and emergency travel tips',
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  isOpen,
  onClose,
  tripContext,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello! I am **TripGenie AI**, your personalized travel concierge for **${tripContext.destination}**.\n\nI can help optimize your budget (current target: ₹${tripContext.budgetINR.toLocaleString('en-IN')}), suggest culinary gems, detail transit options, or customize your day plans.\n\nHow can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          tripContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach assistant server');
      }

      const data = await response.json();
      const reply = data.reply || 'I received your request! Let me review your destination details.';

      const assistantMsg: Message = {
        id: 'reply-' + Date.now(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Chat request failed, providing local assistance:', err);
      const fallbackMsg: Message = {
        id: 'fallback-' + Date.now(),
        role: 'assistant',
        content: `Here are tips for **${tripContext.destination}**:\n\n• **Transit:** Pre-purchase local metro smartcards at the terminal.\n• **Budget:** Keep 10% as emergency buffer.\n• **Connectivity:** Pre-book an eSIM online for smooth navigation.\n\n*Note: Connect to Gemini API or n8n webhook for live continuous multi-turn dialogue.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col transition-all">
      {/* Drawer Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
            <Bot className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-white font-display">TripGenie Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-[11px] text-teal-300 font-mono">
              Ready for {tripContext.destination.split(',')[0]}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isAssistant
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 shadow-sm'
                    : 'bg-teal-500 text-slate-950 font-medium'
                }`}
              >
                <div className="whitespace-pre-line">
                  {msg.content}
                </div>
                <div
                  className={`mt-1.5 text-[10px] text-right font-mono ${
                    isAssistant ? 'text-slate-500' : 'text-slate-800'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-teal-400 bg-slate-900 border border-slate-800 rounded-xl p-3 max-w-[70%]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
            <span>TripGenie is researching your answer...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Chips */}
      <div className="p-3 bg-slate-900/60 border-t border-slate-800 overflow-x-auto scrollbar-none flex items-center gap-1.5">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="flex-shrink-0 text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 transition-colors whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field Form */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about flights, food, metro, or budget tips..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 text-slate-950" />
          </button>
        </form>

        <p className="mt-2 text-[10px] text-center text-slate-500">
          TripGenie provides advisory guidance. Double-check official embassy & airline policies.
        </p>
      </div>
    </div>
  );
};
