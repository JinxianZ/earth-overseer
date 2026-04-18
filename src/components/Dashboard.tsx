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
  Lock
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
    { ticker: "BRENT_CRUDE", price: 65.20, change_24h: 3.5, volatility: 0.25 },
    { ticker: "WTI_CRUDE", price: 61.80, change_24h: 2.8, volatility: 0.22 },
    { ticker: "ZIM_INTEGRATED", price: 28.40, change_24h: -1.2, volatility: 0.18 }
  ],
  logistics_data: [
    { chokepoint: "Suez Canal", status: "BLOCKED", vessel_count: 369 },
    { chokepoint: "Cape of Good Hope", status: "CONGESTED", vessel_count: 45 }
  ]
};

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

type AppTab = 'dashboard' | 'market' | 'geopolitical' | 'logistics';

export default function Dashboard() {
  const [input, setInput] = useState<MacroInput>(HISTORICAL_SUEZ_MOCK);
  const [output, setOutput] = useState<MacroOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AppTab>('dashboard');
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Node initialized", "[SYSTEM] Awaiting ingestion..."]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    addLog("Initiating multimodal synthesis...");
    addLog(`Analyzing ${input.geopolitical_data.length} geopolitical vectors...`);
    
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] font-sans flex w-full h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[var(--sidebar)] text-white p-6 flex flex-col gap-8 flex-shrink-0">
        <div className="flex items-center gap-3 font-extrabold text-sm tracking-widest text-[#38bdf8] uppercase">
          <span className="text-xl italic font-serif">◈</span> Orchestrator v1.5
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={cn(
              "flex items-center gap-3 py-2.5 px-3 rounded-md transition-all text-left w-full",
              activeView === 'dashboard' ? "bg-white/10 text-white font-semibold" : "text-[#94a3b8] hover:text-white"
            )}
          >
            <BarChart3 className="w-4 h-4" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveView('market')}
            className={cn(
              "flex items-center gap-3 py-2.5 px-3 rounded-md transition-all text-left w-full",
              activeView === 'market' ? "bg-white/10 text-white font-semibold" : "text-[#94a3b8] hover:text-white"
            )}
          >
            <Activity className="w-4 h-4" /> Market Pulse
          </button>
          <button 
            onClick={() => setActiveView('geopolitical')}
            className={cn(
              "flex items-center gap-3 py-2.5 px-3 rounded-md transition-all text-left w-full",
              activeView === 'geopolitical' ? "bg-white/10 text-white font-semibold" : "text-[#94a3b8] hover:text-white"
            )}
          >
            <Globe className="w-4 h-4" /> Geopolitical Monitor
          </button>
          <button 
            onClick={() => setActiveView('logistics')}
            className={cn(
              "flex items-center gap-3 py-2.5 px-3 rounded-md transition-all text-left w-full",
              activeView === 'logistics' ? "bg-white/10 text-white font-semibold" : "text-[#94a3b8] hover:text-white"
            )}
          >
            <Truck className="w-4 h-4" /> Logistics Matrix
          </button>
          <div className="flex items-center gap-3 py-2.5 px-3 rounded-md text-[#94a3b8] hover:text-white cursor-pointer transition-colors opacity-50">
            <RefreshCw className="w-4 h-4" /> Backtesting Lab
          </div>
        </nav>

        <div className="mt-auto border-t border-[#334155] pt-4 text-xs text-[#94a3b8]">
          <div className="mb-2 font-bold uppercase tracking-wider">System Parameters</div>
          <div className="font-mono text-[10px] opacity-80 space-y-1">
            <div>MODEL: Gemini 1.5 Pro</div>
            <div>TEMP: 0.1</div>
            <div>SAFETY: UNRESTRICTED</div>
            <div>FORMAT: JSON_V2</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Unified */}
        <header className="p-6 border-b border-[var(--border)] bg-white/50 backdrop-blur-md flex justify-between items-end">
          <div className="header-title">
            <h1 className="text-2xl font-bold text-[#0f172a] capitalize">{activeView} Intelligence Node</h1>
            <p className="text-[var(--text-muted)] text-sm">
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
                  <div className="card overflow-hidden">
                    <div className="card-title">
                      <span>Multimodal Global Ingest</span>
                      <span className="text-[var(--accent)]">{input.geopolitical_data.length + input.corporate_scandals.length} New Alerts</span>
                    </div>
                    <ul className="flex flex-col gap-2.5 overflow-y-auto pr-1">
                      {input.geopolitical_data.map((item, idx) => (
                        <li key={`geo-${idx}`} className="p-2.5 rounded text-xs border-l-[3px] border-[var(--danger)] bg-[#fef2f2]">
                          <strong>GEOPOLITICAL:</strong> {item.event} in {item.location}.
                        </li>
                      ))}
                      {input.market_data.map((item, idx) => (
                        <li key={`market-${idx}`} className="p-2.5 rounded text-xs border-l-[3px] border-[var(--accent)] bg-[#f1f5f9]">
                          <strong>MARKET:</strong> {item.ticker} price volatility spike. Current: {item.price}.
                        </li>
                      ))}
                      <li className="flex-1 flex flex-col justify-end pt-2">
                         <button 
                          onClick={handleAnalyze}
                          disabled={loading}
                          className="w-full py-2 bg-[var(--accent)] text-white rounded text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                          {loading ? "Synthesizing..." : "Run Analysis Node"}
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Card 2: Arbitrage Opportunity Synthesis */}
                  <div className="card overflow-hidden">
                    <div className="card-title">Arbitrage Opportunity Synthesis</div>
                    {output ? (
                      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                        <div className="text-sm leading-relaxed text-[#334155] border-l-2 border-[#cbd5e1] pl-3 italic">
                          {output.arbitrage_opportunity}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-auto">
                          <div className="execution-cell">
                            <div className="cell-label">Financial Action</div>
                            <div className={cn("cell-value uppercase", output.financial_execution.action === 'LONG' ? "text-[var(--success)]" : "text-[var(--danger)]")}>
                              {output.financial_execution.action}
                            </div>
                          </div>
                          <div className="execution-cell">
                            <div className="cell-label">Asset Ticker</div>
                            <div className="cell-value">${output.financial_execution.asset_ticker}</div>
                          </div>
                          <div className="execution-cell">
                            <div className="cell-label">Logistical Action</div>
                            <div className="cell-value text-[var(--warning)]">{output.logistical_execution.action}</div>
                          </div>
                          <div className="execution-cell">
                            <div className="cell-label">Entry Catalyst</div>
                            <div className="cell-value !text-[12px]">{output.financial_execution.entry_catalyst}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                        <ShieldAlert className="w-12 h-12" />
                        <p className="text-xs uppercase font-bold tracking-widest">Awaiting Synthesis Output</p>
                      </div>
                    )}
                  </div>

                  {/* Card 3: Risk Exposure Analysis */}
                  <div className="card overflow-hidden">
                    <div className="card-title">Risk Exposure Analysis</div>
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <div className="text-[13px] text-[var(--text-muted)]">Geopolitical Contagion</div>
                        <div className="stat-bar">
                          <div className="stat-fill bg-[var(--danger)]" style={{ width: '88%' }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-[13px] text-[var(--text-muted)]">Regulatory Counter-Action</div>
                        <div className="stat-bar">
                          <div className="stat-fill bg-[var(--warning)]" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-[13px] text-[var(--text-muted)]">Liquidity Depth Variance</div>
                        <div className="stat-bar">
                          <div className="stat-fill" style={{ width: '22%' }}></div>
                        </div>
                      </div>
                      {output && (
                        <div className="text-[11px] text-[var(--text-muted)] mt-2 pt-3 border-t border-[var(--border)] leading-tight italic">
                          Primary Downside: {output.risk_exposure}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 4: Logistical Execution Vector */}
                  <div className="card overflow-hidden">
                    <motion.div 
                      whileHover={{ scale: 1.02, x: 5 }}
                      onClick={() => setActiveView('logistics')}
                      className="cursor-pointer group flex items-center gap-2 mb-2"
                    >
                      <div className="text-xs font-black uppercase tracking-tighter text-[#0f172a] group-hover:text-[var(--accent)] transition-colors">
                        Live Global AIS Maritime Feed
                      </div>
                      <ChevronRight className="w-3 h-3 text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all" />
                    </motion.div>
                    <div className="flex-1 min-h-[140px] relative group overflow-hidden">
                       <GlobalShipMap />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="text-[11px] border border-[var(--border)] p-1.5 rounded bg-slate-50">
                        <div className="text-[var(--text-muted)] text-[9px] uppercase font-bold">Target Commodity</div>
                        <strong className="block truncate">{output?.logistical_execution.target_commodity || "Petro-Natural Gas"}</strong>
                      </div>
                      <div className="text-[11px] border border-[var(--border)] p-1.5 rounded bg-slate-50">
                        <div className="text-[var(--text-muted)] text-[9px] uppercase font-bold">Geo-Focus</div>
                        <strong className="block truncate">{output?.logistical_execution.geographic_focus || "Global South"}</strong>
                      </div>
                    </div>
                  </div>
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
                  <MarketAnalytics />
                </motion.div>
              )}

              {activeView !== 'dashboard' && activeView !== 'geopolitical' && activeView !== 'logistics' && activeView !== 'market' && (
                <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] font-mono text-sm">
                  VECTOR_NODE [{activeView}] UNDER_MAINTENANCE...
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Stock Ticker */}
          <aside className="w-[180px] flex-shrink-0 border-l border-[var(--border)] bg-white/30 backdrop-blur-sm">
            <StockTicker />
          </aside>
        </div>
      </div>
    </div>
  );
}
