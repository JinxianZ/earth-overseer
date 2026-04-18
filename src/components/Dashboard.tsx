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

export default function Dashboard() {
  const [input, setInput] = useState<MacroInput>(HISTORICAL_SUEZ_MOCK);
  const [output, setOutput] = useState<MacroOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Node initialized", "[SYSTEM] Awaiting ingestion..."]);
  const [mapExpanded, setMapExpanded] = useState(false);

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
      setActiveTab('output');
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
          <div className="flex items-center gap-3 py-2.5 px-3 rounded-md bg-white/10 text-white font-semibold cursor-pointer">
            <BarChart3 className="w-4 h-4" /> Dashboard
          </div>
          <div className="flex items-center gap-3 py-2.5 px-3 rounded-md text-[#94a3b8] hover:text-white cursor-pointer transition-colors">
            <Activity className="w-4 h-4" /> Market Pulse
          </div>
          <div className="flex items-center gap-3 py-2.5 px-3 rounded-md text-[#94a3b8] hover:text-white cursor-pointer transition-colors">
            <Globe className="w-4 h-4" /> Geopolitical Monitor
          </div>
          <div className="flex items-center gap-3 py-2.5 px-3 rounded-md text-[#94a3b8] hover:text-white cursor-pointer transition-colors">
            <Truck className="w-4 h-4" /> Logistics Matrix
          </div>
          <div className="flex items-center gap-3 py-2.5 px-3 rounded-md text-[#94a3b8] hover:text-white cursor-pointer transition-colors">
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

      {/* Main Content Area (Center + Right) */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 p-6 grid grid-rows-[auto_1fr] gap-6 overflow-hidden">
          {/* Header */}
          <div className="header border-b border-[var(--border)] pb-4 flex justify-between items-end">
            <div className="header-title">
              <h1 className="text-2xl font-bold text-[#0f172a]">Strategic Arbitrage Node</h1>
              <p className="text-[var(--text-muted)] text-sm">Synthesizing global anomalies into actionable capital flows.</p>
            </div>
            <div className="status-chip">
              <div className="status-indicator animate-pulse"></div>
              Live Data Sync: 0.04s Latency
            </div>
          </div>

          {/* Grid Container */}
          <div className="grid grid-cols-[1fr_1.2fr] grid-rows-[1fr_1fr] gap-5 overflow-hidden">
          {!output && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center opacity-20 pointer-events-none">
              <Globe className="w-48 h-48 mb-6" />
              <h2 className="text-3xl font-serif italic mb-2">Awaiting Data Ingestion</h2>
              <p className="max-w-md font-mono text-sm leading-relaxed">
                Node is currently in IDLE state. Use the Ingestion Panel to feed geopolitical and logistical vectors for synthesis.
              </p>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="card-title">
              <span>Multimodal Global Ingest</span>
              <span className="text-[var(--accent)]">{input.geopolitical_data.length + input.corporate_scandals.length} New Alerts</span>
            </div>
            <ul className="flex flex-col gap-2.5 overflow-y-auto pr-1">
              {input.geopolitical_data.map((item, idx) => (
                <li key={`geo-${idx}`} className="p-2.5 rounded bg-[#f1f5f9] text-xs border-l-[3px] border-[var(--danger)] bg-[#fef2f2]">
                  <strong>GEOPOLITICAL:</strong> {item.event} in {item.location}.
                </li>
              ))}
              {input.market_data.map((item, idx) => (
                <li key={`market-${idx}`} className="p-2.5 rounded bg-[#f1f5f9] text-xs border-l-[3px] border-[var(--accent)]">
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
                <div className="text-sm leading-relaxed text-[#334155] italic border-l-2 border-[#cbd5e1] pl-3 italic">
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
            <div className="card-title">Logistical Execution Vector</div>
            <div className="text-xs font-semibold text-[var(--text-main)] mb-2">Live Global AIS Maritime Feed</div>
            <div className="flex-1 min-h-[140px] relative overflow-hidden group">
               <GlobalShipMap 
                 isExpanded={mapExpanded} 
                 onToggleExpand={() => setMapExpanded(!mapExpanded)} 
               />
               {/* Click-away backdrop for expanded state */}
               {mapExpanded && (
                 <div 
                   className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" 
                   onClick={() => setMapExpanded(false)}
                 />
               )}
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
        </div>
      </main>

        {/* Right Sidebar - Stock Ticker */}
        <aside className="w-[180px] flex-shrink-0 border-l border-[var(--border)]">
          <StockTicker />
        </aside>
      </div>
    </div>
  );
}
