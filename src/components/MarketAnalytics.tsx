import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  MessageSquare, 
  Activity, 
  Terminal, 
  Zap, 
  Cpu, 
  Send, 
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Search,
  ChevronRight,
  ShieldAlert,
  Clock,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { generalQuantChat } from '../geminiService';

// TradingView Widget initialization logic
declare global {
  interface Window {
    TradingView: any;
  }
}

// Utility for merging tailwind classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

// Generate some mock tick data for the graphs
const generateTickData = (basePrice: number, points: number = 30) => {
  let price = basePrice;
  return Array.from({ length: points }).map((_, i) => {
    price = price + (Math.random() - 0.5) * (price * 0.02);
    return {
      time: `${i}:00`,
      price: parseFloat(price.toFixed(2)),
      vol: Math.floor(Math.random() * 1000)
    };
  });
};

const TICK_DATA_MAERSK = generateTickData(12450.50);
const TICK_DATA_BRENT = generateTickData(82.45);
const VOLATILITY_DATA = Array.from({ length: 24 }).map((_, i) => ({
    hour: `${i}h`,
    risk: Math.sin(i / 3) * 20 + 50 + Math.random() * 10
}));

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function MarketAnalytics() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: "SYSTEM_INITIALIZED: Agent 'QUANT-01' online. Provide a specific equity ticker or geopolitical vector for deep-scan analysis.", timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('MAERSK-B');
  const [trackedAssets, setTrackedAssets] = useState<{ symbol: string; data: any[] }[]>([
    { symbol: 'MAERSK-B', data: TICK_DATA_MAERSK },
    { symbol: 'BRENT', data: TICK_DATA_BRENT },
    { symbol: 'BTC-USD', data: generateTickData(64500.20) },
    { symbol: 'GC=F', data: generateTickData(2340.50) },
  ]);
  const [assetSearch, setAssetSearch] = useState('');
  const [activeChart, setActiveChart] = useState<'line' | 'area' | 'bar'>('area');
  const [corporateIntel, setCorporateIntel] = useState<any[]>([]);
  const container = useRef<HTMLDivElement>(null);

  const fetchCorporateIntel = async () => {
    try {
      const res = await fetch('/api/corporate-intel');
      const data = await res.json();
      setCorporateIntel(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch corporate intel:', e);
      setCorporateIntel([]);
    }
  };

  useEffect(() => {
    fetchCorporateIntel();
  }, []);

  useEffect(() => {
    // TradingView Widget Script Loading
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== "undefined" && container.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: selectedAsset === 'MAERSK-B' ? 'CO:MAERSK_B' : 
                  selectedAsset === 'BRENT' ? 'FX:UKOIL' : 
                  selectedAsset === 'BTC-USD' ? 'BITSTAMP:BTCUSD' : 
                  selectedAsset === 'GC=F' ? 'COMEX:GC1!' : selectedAsset,
          interval: "D",
          timezone: "Etc/UTC",
          theme: "light",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: container.current.id,
        });
      }
    };
    document.head.appendChild(script);
    return () => {
      // Clean up if necessary
    };
  }, [selectedAsset]);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetSearch.trim()) return;
    const symbol = assetSearch.toUpperCase();
    if (!trackedAssets.find(t => t.symbol === symbol)) {
      setTrackedAssets(prev => [...prev, { symbol, data: [] }]);
      setSelectedAsset(symbol);
    }
    setAssetSearch('');
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await generalQuantChat(inputValue);

      const aiMsg: ChatMessage = { 
        role: 'ai', 
        content: response, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      setMessages(prev => [...prev, { role: 'ai', content: "CRITICAL_ERROR: Neural link terminated. Retry connection.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const currentAssetData = trackedAssets.find(t => t.symbol === selectedAsset);
  const currentChartData = currentAssetData?.data || [];

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-hidden">
      {/* Analytics Breadcrumb/Header */}
      <div className="px-6 py-3 border-b border-[var(--border)] bg-white/40 backdrop-blur-md flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2 py-1 bg-[#1e293b] text-white rounded text-[10px] font-black uppercase tracking-widest">
                <Cpu className="w-3 h-3" /> NODE_04_PULSE
            </div>
            <div className="flex items-center gap-2 text-[#64748b]">
                <Activity className="w-3 h-3 text-[var(--accent)]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">HFT Stream: Active</span>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[9px] font-mono font-bold text-[#64748b]">DELTA: +0.02%</span>
            </div>
         </div>
      </div>

      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 overflow-hidden">
        
        {/* Left Column: AI QUANT CHAT */}
        <div className="flex flex-col bg-white border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
          <div className="p-4 border-b border-[var(--border)] bg-[#0f172a] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="text-[11px] font-black uppercase tracking-widest italic">Quant-01 Intelligence</h3>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-mono text-emerald-400">READY</span>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-white/95"
          >
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  msg.role === 'user' ? "ml-auto items-end" : "items-start"
                )}
              >
                <div className={cn(
                  "p-3 rounded-xl text-[11px] leading-relaxed shadow-sm",
                  msg.role === 'user' 
                    ? "bg-[var(--accent)] text-white font-medium" 
                    : "bg-[#f1f5f9] text-[#1e293b] border border-[#e2e8f0] font-mono"
                )}>
                  {msg.content}
                </div>
                <span className="text-[8px] mt-1 text-[#94a3b8] font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex gap-1 items-center p-2 bg-slate-50 rounded-lg w-fit">
                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-75" />
                <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150" />
              </div>
            )}
          </div>

          <form 
            onSubmit={handleSendMessage}
            className="p-3 bg-slate-50 border-t border-[var(--border)] flex gap-2"
          >
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Query structural friction..."
              className="flex-1 px-3 py-2 bg-white border border-[var(--border)] rounded-lg text-xs placeholder:italic focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all font-mono"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 bg-[#0f172a] text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: GRAPH & ANALYTICS */}
        <div className="flex flex-col gap-6 overflow-hidden custom-scrollbar overflow-y-auto">
          {/* Main Chart Card */}
          <div className="flex-shrink-0 min-h-[500px] bg-white border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#0f172a]">TradingView Pulse Matrix</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        {trackedAssets.map(asset => (
                            <button
                                key={asset.symbol}
                                onClick={() => setSelectedAsset(asset.symbol)}
                                className={cn(
                                    "px-3 py-1 rounded text-[10px] font-bold uppercase transition-all border",
                                    selectedAsset === asset.symbol ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "bg-white text-[#94a3b8] border-[#e2e8f0] hover:border-[var(--accent)]"
                                )}
                            >
                                {asset.symbol}
                            </button>
                        ))}
                        <form onSubmit={handleAddAsset} className="relative group">
                          <input 
                            type="text" 
                            value={assetSearch}
                            onChange={(e) => setAssetSearch(e.target.value)}
                            placeholder="+ Add Asset (e.g. NVDA, SOL-USD)..."
                            className="pl-3 pr-8 py-1 bg-slate-50 border border-dashed border-[#cbd5e1] rounded text-[9px] text-[#0f172a] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all uppercase font-mono w-[180px]"
                          />
                          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[var(--accent)]">
                            <Search className="w-3 h-3" />
                          </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[380px] bg-slate-50 rounded-xl overflow-hidden border border-[#e2e8f0]">
                <div 
                  id={`tradingview_${selectedAsset.replace(/[^a-zA-Z0-9]/g, '_')}`} 
                  ref={container} 
                  className="w-full h-full"
                />
            </div>
          </div>

          {/* Corporate Intelligence Sections */}
          <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-title">
                <span>Corporate Scandals & Restructuring</span>
                <span className="text-[var(--danger)]">Critical Alerts</span>
              </div>
              <div className="flex flex-col gap-3">
                {corporateIntel.filter(i => i.category === 'SCANDALS' || i.category === 'LAYOFFS').map(item => (
                  <div key={item.id} className="p-3 bg-[#fef2f2] border-l-2 border-[var(--danger)] rounded text-[11px]">
                    <div className="flex justify-between items-start mb-1">
                      <strong className="text-[#991b1b] uppercase tracking-tighter">{item.company} | {item.category}</strong>
                      <span className="text-[8px] text-[#94a3b8] font-mono">{item.date}</span>
                    </div>
                    <div className="font-bold text-[#0f172a] mb-1">{item.title}</div>
                    <div className="text-[var(--text-muted)] leading-tight">{item.impact}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                <span>Product Launches & Strategic News</span>
                <span className="text-[var(--success)]">Expansion Phase</span>
              </div>
              <div className="flex flex-col gap-3">
                {corporateIntel.filter(i => i.category === 'PRODUCTS' || i.category === 'NEWS').map(item => (
                  <div key={item.id} className="p-3 bg-[#ecfdf5] border-l-2 border-[var(--success)] rounded text-[11px]">
                    <div className="flex justify-between items-start mb-1">
                      <strong className="text-[#065f46] uppercase tracking-tighter">{item.company} | {item.category}</strong>
                      <span className="text-[8px] text-[#94a3b8] font-mono">{item.date}</span>
                    </div>
                    <div className="font-bold text-[#0f172a] mb-1">{item.title}</div>
                    <div className="text-[var(--text-muted)] leading-tight">{item.impact}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[140px] grid grid-cols-2 gap-6 mb-6">
            <div className="bg-[#0f172a] rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap className="w-16 h-16 text-yellow-400" />
                </div>
                <h4 className="text-[10px] font-black text-[#64748b] tracking-[0.2em] relative z-10 uppercase">Geopolitical Exposure</h4>
                <div className="flex items-end justify-between relative z-10">
                    <span className="text-2xl font-black text-white italic">78.4</span>
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" /> Stable
                    </span>
                </div>
            </div>
            
            <div className="bg-white border border-[var(--border)] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                <h4 className="text-[10px] font-black text-[#64748b] tracking-[0.2em] uppercase mb-2">Volatility Vector</h4>
                <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={VOLATILITY_DATA}>
                        <Line type="basis" dataKey="risk" stroke="#2563eb" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
