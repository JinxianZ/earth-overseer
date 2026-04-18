import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ShieldAlert, 
  TrendingUp, 
  Truck, 
  Terminal, 
  Cpu, 
  Zap,
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  RefreshCw,
  Search,
  Lock,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { MacroInput, MacroOutput } from '../types';
import { analyzeMacroRisk } from '../geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const HISTORICAL_SUEZ_MOCK: MacroInput = {
  geopolitical_data: [
    { event: "Suez Canal Blockage (Ever Given)", location: "Suez Canal, Egypt", impact_score: 9.5 },
    { event: "Tensions in Red Sea corridor", location: "Red Sea", impact_score: 6.2 }
  ],
  corporate_scandals: [
    { company: "Evergreen Marine Corp", allegation: "Logistical failure / massive liability", market_cap_loss: "$500M (estimated)" }
  ],
  market_data: [
    { ticker: "BRENT_CRUDE", price: 82.20, change_24h: 3.5, volatility: 0.25 },
    { ticker: "WTI_CRUDE", price: 78.80, change_24h: 2.8, volatility: 0.22 },
    { ticker: "ZIM_INTEGRATED", price: 28.40, change_24h: -1.2, volatility: 0.18 }
  ],
  logistics_data: [
    { chokepoint: "Suez Canal", status: "BLOCKED", vessel_count: 369 },
    { chokepoint: "Cape of Good Hope", status: "CONGESTED", vessel_count: 45 }
  ]
};

interface YahooData {
  news: any[];
  indicators: any[];
  quotes: any[];
}

const CHART_DATA = [
  { time: '00:00', value: 2400 },
  { time: '04:00', value: 1398 },
  { time: '08:00', value: 3800 },
  { time: '12:00', value: 3908 },
  { time: '16:00', value: 4800 },
  { time: '20:00', value: 3800 },
  { time: '24:00', value: 4300 },
];

import GlobalShipMap from './GlobalShipMap';
import StockTicker from './StockTicker';
import GeopoliticalMonitor from './GeopoliticalMonitor';
import MarketAnalytics from './MarketAnalytics';
import TruthVerifyTerminal from './TruthVerifyTerminal';
import SimulationLab from './SimulationLab';

type AppTab = 'dashboard' | 'market' | 'geopolitical' | 'logistics' | 'truth' | 'simulation';

// New Component for Orbital Navigation
const Satellite = ({ color = "#38bdf8" }: { color?: string }) => (
  <div className="relative flex items-center justify-center scale-[0.6]">
    {/* Solar Panels */}
    <div className="absolute w-8 h-2 bg-slate-700/80 border border-white/10 rounded-sm overflow-hidden flex">
        <div className="flex-1 border-r border-white/5 bg-slate-800" />
        <div className="flex-1 border-r border-white/5 bg-slate-800" />
        <div className="flex-1 bg-slate-800" />
    </div>
    {/* Satellite Body */}
    <div className="absolute w-2 h-3 bg-slate-400 rounded-sm shadow-sm" />
    {/* Antenna */}
    <div className="absolute -top-3 w-[1px] h-3 bg-slate-400" />
    <div className="absolute -top-4 w-1 h-1 bg-slate-300 rounded-full" />
    {/* Dynamic Signal Indicator */}
    <motion.div 
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 1, repeat: Infinity }}
      className="absolute z-10 w-0.5 h-0.5 rounded-full"
      style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
    />
  </div>
);

const OrbitalNav = ({ 
  activeView, 
  setActiveView 
}: { 
  activeView: AppTab, 
  setActiveView: (view: AppTab) => void 
}) => {
  const tabs: { id: AppTab; icon: any; label: string }[] = [
    { id: 'dashboard', icon: BarChart3, label: 'Control' },
    { id: 'market', icon: Activity, label: 'Pulse' },
    { id: 'geopolitical', icon: Globe, label: 'Geo' },
    { id: 'logistics', icon: Truck, label: 'Matrix' },
    { id: 'truth', icon: ShieldCheck, label: 'Truth' },
    { id: 'simulation', icon: Clock, label: 'Lab' }
  ];

  return (
    <div className="relative w-full aspect-square flex items-center justify-center p-4">
      {/* Background Orbital Rings */}
      <div className="absolute inset-0 border border-white/5 rounded-full scale-[0.85]" />
      <div className="absolute inset-0 border border-white/5 rounded-full scale-[0.6]" />
      
      {/* Central Globe - 3D Spherical Effect */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setActiveView('dashboard')}
        className="relative z-20 w-32 h-32 rounded-full cursor-pointer group shadow-[0_0_50px_var(--accent)]"
        style={{
          background: "radial-gradient(circle at 35% 35%, var(--accent) 0%, var(--bg) 100%)",
          boxShadow: "inset -10px -10px 40px rgba(0,0,0,0.5), inset 10px 10px 40px rgba(255,255,255,0.1), 0 0 30px var(--accent)"
        }}
      >
        {/* Globe Atmosphere/Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#38bdf8]/0 to-[#38bdf8]/10 pointer-events-none" />
        
        {/* Moving Map Texture */}
        <motion.div 
          animate={{ backgroundPositionX: ["0%", "100%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-40 rounded-full"
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/simple-dashed.png')",
            backgroundSize: "200% 100%",
            maskImage: "radial-gradient(circle, black 100%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(circle, black 100%, transparent 100%)"
          }}
        />

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            <Globe className="w-10 h-10 text-[#38bdf8] mb-1 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#38bdf8] drop-shadow-md">ORBIT</span>
        </div>
        
        {/* Surface reflection */}
        <div className="absolute top-4 left-4 w-12 h-6 bg-white/10 rounded-full blur-md -rotate-45 pointer-events-none" />
      </motion.div>

      {/* Rotating Satellites - Realistic Models */}
      {[0, 1].map((i) => (
        <motion.div
          key={`sat-${i}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 25 + i * 10, repeat: Infinity, ease: "linear" }}
          className="absolute w-full h-full pointer-events-none"
          style={{ rotate: i * 180 }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
             <Satellite color={i === 0 ? "#38bdf8" : "#fbbf24"} />
          </div>
        </motion.div>
      ))}

      {/* Orbital Tabs */}
      {tabs.map((tab, idx) => {
        const total = tabs.length;
        const angle = (idx * 360) / total - 90; // Start from top
        const radius = 90; // Orbital radius in pixels

        return (
          <motion.button
            key={tab.id}
            initial={false}
            animate={{
              x: Math.cos((angle * Math.PI) / 180) * radius,
              y: Math.sin((angle * Math.PI) / 180) * radius,
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveView(tab.id)}
            className={cn(
              "absolute z-30 w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all border shadow-lg backdrop-blur-md",
              activeView === tab.id 
                ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-[var(--accent)]/40" 
                : "bg-black/60 text-[var(--text-muted)] border-white/10 hover:border-[var(--accent)] hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-[7px] font-bold uppercase mt-0.5 tracking-tighter">{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default function Dashboard() {
  const [input, setInput] = useState<MacroInput>(HISTORICAL_SUEZ_MOCK);
  const [output, setOutput] = useState<MacroOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AppTab>('dashboard');
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Node initialized", "[SYSTEM] Awaiting ingestion..."]);
  const [yahooData, setYahooData] = useState<YahooData | null>(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchYahoo = async () => {
      try {
        const res = await fetch('/api/yahoo-ingest?q=global+logistics+market');
        const data = await res.json();
        if (data && !data.error) {
          setYahooData(data);
          addLog(`Yahoo Ingest: Sync'd ${data.news?.length || 0} intelligence vectors.`);
        } else {
          addLog(`Yahoo Ingest: Node failure - ${data?.error || 'Invalid format'}`);
        }
      } catch (err) {
        addLog("Yahoo Ingest: Node failure.");
      }
    };
    fetchYahoo();
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    addLog("Initiating multimodal synthesis...");
      // Safely count vectors
      const vectorCount = (input.geopolitical_data?.length || 0) + 
                          (input.corporate_scandals?.length || 0) + 
                          (input.logistics_data?.length || 0);

      addLog(`Analyzing ${vectorCount} multimodal vectors...`);
    
    try {
      const result = await analyzeMacroRisk(input);
      setOutput(result);
      addLog("Synthesis complete. Arbitrage opportunity identified.");
    } catch (err: any) {
      setError(err.message || "Analysis failed");
      addLog(`ERROR: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] font-sans flex w-full h-screen overflow-hidden transition-colors duration-500" data-theme={theme}>
      {/* Sidebar - Redesigned to Orbital Command Hub */}
      <aside className="w-[300px] bg-[var(--sidebar)] text-[var(--text-main)] p-6 flex flex-col gap-8 flex-shrink-0 border-r border-white/5 relative overflow-hidden transition-colors duration-500">
        {/* Background circuit pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')]" />
        
        <div className="relative z-10 flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 font-extrabold text-sm tracking-widest text-[var(--accent)] uppercase">
                <span className="text-xl italic font-serif">◈</span> Node_04
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-mono text-emerald-400">SYNC_OK</span>
            </div>
        </div>

        <div className="relative flex-1 flex flex-col gap-8">
            <div className="py-4">
                <OrbitalNav activeView={activeView} setActiveView={setActiveView} />
            </div>

            <div className="px-2">
                <div className="mb-4 font-black uppercase tracking-widest text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Aesthetic Modules</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'dark', label: 'VOID', border: '#38bdf8' },
                        { id: 'light', label: 'CLEAN', border: '#2563eb' },
                        { id: 'pink', label: 'NEON', border: '#db2777' },
                        { id: 'matrix', label: 'GLITCH', border: '#00ff41' }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={cn(
                                "flex-1 min-w-[50px] p-2 rounded border transition-all flex flex-col items-center gap-1 group relative overflow-hidden",
                                theme === t.id 
                                    ? "bg-white/10 border-[var(--accent)]" 
                                    : "bg-white/5 border-white/5 hover:border-white/20"
                            )}
                        >
                            <div 
                                className="w-full h-1 rounded-full mb-1" 
                                style={{ backgroundColor: t.border }}
                            />
                            <span className={cn(
                                "text-[7px] font-black tracking-widest uppercase",
                                theme === t.id ? "text-[var(--text-main)]" : "text-slate-500"
                            )}>
                                {t.label}
                            </span>
                            {theme === t.id && (
                                <motion.div 
                                    layoutId="theme-ring"
                                    className="absolute inset-0 border border-[var(--accent)] opacity-50 rounded"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-2">
                <div className="mb-4 font-black uppercase tracking-widest text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Active Telemetry</span>
                    <RefreshCw className="w-2.5 h-2.5 animate-spin text-[var(--accent)]" />
                </div>
                <div className="space-y-3">
                    {logs.slice(0, 4).map((log, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-2 bg-white/5 rounded border border-white/5 font-mono text-[9px] text-slate-400 leading-tight"
                        >
                            {log}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>

        <div className="relative z-10 mt-auto border-t border-white/5 pt-4 text-[9px] text-slate-500">
          <div className="mb-2 font-bold uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-2.5 h-2.5" /> Security Protocol V2
          </div>
          <div className="font-mono opacity-80 space-y-1">
             <div className="flex justify-between"><span>NODE_ID:</span> <span className="text-[var(--text-main)]">AIS_37_Ω</span></div>
             <div className="flex justify-between"><span>DIST:</span> <span className="text-[var(--text-main)]">ENCRYPTED</span></div>
             <div className="flex justify-between"><span>SAFETY:</span> <span className="text-emerald-500">NOMINAL</span></div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Unified */}
        <header className="p-6 border-b border-[var(--border)] bg-white/5 backdrop-blur-xl flex justify-between items-end">
          <div className="header-title">
            <h1 className="text-2xl font-black text-white capitalize italic tracking-tight">{activeView} Intelligence Node</h1>
            <p className="text-[var(--text-muted)] text-[10px] uppercase font-mono tracking-widest mt-1">
              {activeView === 'dashboard' ? "Synthesizing global anomalies into actionable capital flows." : 
               activeView === 'geopolitical' ? "Monitoring strategic conflict zones and high-impact news vectors." :
               "High-frequency data streams and logistical matrix oversight."}
            </p>
          </div>
          <div className="status-chip">
            <div className="status-indicator animate-pulse"></div>
            Vector Stream: Active
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Active View Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              {activeView === 'dashboard' && (
                <motion.main 
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 p-6 grid grid-cols-[1fr_1.2fr] grid-rows-[1fr_1fr] gap-5 overflow-hidden"
                >
                  <div className="card overflow-hidden flex flex-col">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="card-title flex justify-between items-center mb-4"
                    >
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[var(--accent)]" />
                        <span>Section F: Multimodal Global Ingest</span>
                      </div>
                      <span className="text-[var(--accent)] text-[10px] animate-pulse">
                        {(Array.isArray(yahooData?.news) && Array.isArray(yahooData?.indicators)) 
                          ? `${yahooData!.news!.length + yahooData!.indicators!.length} Active Feeds` 
                          : "Synchronizing..."}
                      </span>
                    </motion.div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                      {/* Yahoo Indicators */}
                      <div className="grid grid-cols-2 gap-2">
                        {(yahooData?.indicators || []).map((ind, idx) => (
                          <motion.div
                            key={`ind-${idx}`}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.05, borderLeft: '4px solid var(--accent)' }}
                            className="p-2 bg-white/5 border border-white/5 rounded text-[10px] flex justify-between items-center"
                          >
                            <span className="font-bold text-slate-400">{ind.symbol}</span>
                            <span className={cn(
                              "font-mono font-black",
                              ind.changePercent >= 0 ? "text-emerald-500" : "text-rose-500"
                            )}>
                              {ind.changePercent >= 0 ? '+' : ''}{ind.changePercent?.toFixed(2)}%
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Yahoo News Feed */}
                      <AnimatePresence>
                        {(yahooData?.news || []).map((news, idx) => (
                          <motion.div
                            key={`news-${idx}`}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + idx * 0.05 }}
                            whileHover={{ x: 5, backgroundColor: 'rgba(56, 189, 248, 0.05)' }}
                            className="p-2.5 rounded text-[10px] border-l-[3px] border-[var(--accent)] bg-white/5 shadow-sm cursor-pointer group hover:border-white transition-all"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[var(--accent)] font-bold uppercase tracking-tighter">{news.publisher}</span>
                              <span className="text-[8px] text-slate-500">{new Date(news.providerPublishTime * 1000).toLocaleTimeString()}</span>
                            </div>
                            <div className="text-slate-300 font-medium leading-tight group-hover:text-white transition-colors">
                              {news.title}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {!yahooData && (
                        <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-20">
                          <RefreshCw className="w-8 h-8 animate-spin" />
                          <span className="text-[10px] uppercase font-black tracking-widest text-center">Inhaling Global Data Stream...</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                       <motion.button 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAnalyze}
                        disabled={loading || !yahooData}
                        className="w-full py-2.5 bg-[var(--accent)] text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-[var(--accent)]/20 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Synthesizing...
                          </>
                        ) : (
                          <>
                            <Activity className="w-3 h-3" />
                            Ingest Matrix Synthesis
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Card 2: Arbitrage Opportunity Synthesis */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card overflow-hidden"
                  >
                    <div className="card-title flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#38bdf8]" />
                      Arbitrage Opportunity Synthesis
                    </div>
                    {output ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col gap-3 overflow-y-auto"
                      >
                        <div className="text-sm leading-relaxed text-slate-300 border-l-2 border-[var(--accent)] pl-3 italic">
                          {output.arbitrage_opportunity}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-auto">
                          {[
                            { label: 'Financial Action', value: output.financial_execution.action, color: output.financial_execution.action === 'LONG' ? "text-emerald-500" : "text-rose-500" },
                            { label: 'Asset Ticker', value: `${output.financial_execution.asset_ticker}` },
                            { label: 'Logistical Action', value: output.logistical_execution.action, color: "text-amber-500" },
                            { label: 'Entry Catalyst', value: output.financial_execution.entry_catalyst, small: true }
                          ].map((cell, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.3 + idx * 0.1 }}
                              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                              className="execution-cell"
                            >
                              <div className="cell-label">{cell.label}</div>
                              <div className={cn("cell-value truncate", cell.color, cell.small ? "text-[10px]" : "text-xs")}>
                                {cell.value}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                        <ShieldAlert className="w-12 h-12" />
                        <p className="text-xs uppercase font-bold tracking-widest">Awaiting Synthesis Output</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Card 3: Risk Exposure Analysis */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card overflow-hidden"
                  >
                    <div className="card-title flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Risk Exposure Analysis
                    </div>
                    <div className="flex flex-col gap-4">
                      {[
                        { label: 'Geopolitical Contagion', width: '88%', color: 'bg-rose-500' },
                        { label: 'Regulatory Counter-Action', width: '45%', color: 'bg-amber-500' },
                        { label: 'Liquidity Depth Variance', width: '22%', color: 'bg-blue-500' }
                      ].map((risk, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5">
                          <div className="text-[11px] font-bold text-slate-400 tracking-tight">{risk.label}</div>
                          <div className="stat-bar w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: risk.width }}
                              transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                              className={cn("h-full", risk.color)} 
                            />
                          </div>
                        </div>
                      ))}
                      {output && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[10px] text-slate-400 mt-2 pt-3 border-t border-white/5 leading-tight italic bg-black/40 p-3 rounded-xl shadow-inner"
                        >
                          <strong>Critical Downside:</strong> {output.risk_exposure}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Card 4: Logistical Execution Vector */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card overflow-hidden group"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.02, x: 5 }}
                      onClick={() => setActiveView('logistics')}
                      className="cursor-pointer group flex items-center gap-2 mb-2"
                    >
                      <div className="text-xs font-black uppercase tracking-tighter text-slate-200 group-hover:text-[var(--accent)] transition-colors">
                        Live Global AIS Maritime Feed
                      </div>
                      <ChevronRight className="w-3 h-3 text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all" />
                    </motion.div>
                    <div className="flex-1 min-h-[140px] relative group overflow-hidden bg-black/40 rounded-xl border border-white/5">
                       <GlobalShipMap />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="text-[11px] border border-[var(--border)] p-2 rounded-xl bg-black/20">
                        <div className="text-[var(--text-muted)] text-[9px] uppercase font-bold tracking-widest mb-1">Target Commodity</div>
                        <strong className="block truncate text-white">{output?.logistical_execution.target_commodity || "Petro-Natural Gas"}</strong>
                      </div>
                      <div className="text-[11px] border border-[var(--border)] p-2 rounded-xl bg-black/20">
                        <div className="text-[var(--text-muted)] text-[9px] uppercase font-bold tracking-widest mb-1">Geo-Focus</div>
                        <strong className="block truncate text-white">{output?.logistical_execution.geographic_focus || "Global South"}</strong>
                      </div>
                    </div>
                  </motion.div>
                </motion.main>
              )}

              {activeView === 'geopolitical' && (
                <motion.div
                  key="geopolitical"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex overflow-hidden"
                >
                  <GeopoliticalMonitor />
                </motion.div>
              )}

              {activeView === 'logistics' && (
                <motion.div
                  key="logistics"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <GlobalShipMap isExpanded />
                </motion.div>
              )}

              {activeView === 'market' && (
                <motion.div
                  key="market"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex-1 flex overflow-hidden"
                >
                  <MarketAnalytics theme={theme} />
                </motion.div>
              )}

              {activeView === 'truth' && (
                <motion.div
                  key="truth"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex overflow-hidden"
                >
                  <TruthVerifyTerminal />
                </motion.div>
              )}

              {activeView === 'simulation' && (
                <motion.div
                  key="simulation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex overflow-hidden"
                >
                  <SimulationLab input={input} theme={theme} />
                </motion.div>
              )}

              {activeView !== 'dashboard' && activeView !== 'geopolitical' && activeView !== 'logistics' && activeView !== 'market' && activeView !== 'truth' && activeView !== 'simulation' && (
                <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] font-mono text-sm">
                  VECTOR_NODE [{activeView}] UNDER_MAINTENANCE...
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Stock Ticker */}
          <aside className="w-[180px] flex-shrink-0 border-l border-[var(--border)] bg-black/40 backdrop-blur-md z-20">
            <StockTicker />
          </aside>
        </div>
      </div>
    </div>
  );
}
