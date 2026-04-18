import React, { useState } from 'react';
import { ShieldCheck, Search, AlertCircle, ExternalLink, Activity, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { verifyFact, FactCheckResult } from '../geminiService';

export default function TruthVerifyTerminal() {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!query.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await verifyFact(query);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Intelligence Node timeout. Please retry.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0c121e] overflow-hidden relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-white/5 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#38bdf8]" />
          <div>
            <h2 className="font-black uppercase tracking-widest text-[#38bdf8] text-sm">Truth_Sentry_Node</h2>
            <div className="text-[10px] font-mono text-slate-500">REALTIME_MISINFO_RESEARCH_ARRAY</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <div className="text-[9px] font-black uppercase text-slate-500 mb-0.5">Grounding Node</div>
                <div className="flex items-center gap-1.5 justify-end">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-mono text-emerald-400">ACTIVE_SCAN</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-8 overflow-hidden z-10">
        {/* Input Pane */}
        <div className="w-1/3 flex flex-col gap-6">
          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-400">
               <Activity className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Ingest Terminal</span>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed italic">
                Paste any article URL, viral claim, or suspected misinformation. 
                The AI agent will perform an exhaustive cross-reference search across verified intelligence nodes.
            </p>

            <textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ENTER_CLAIM_OR_URL..."
              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono text-xs focus:outline-none focus:border-[#38bdf8]/50 transition-colors resize-none placeholder:opacity-30"
            />

            <button
              onClick={handleVerify}
              disabled={isAnalyzing || !query.trim()}
              className="w-full py-3 bg-[#38bdf8] hover:bg-[#0ea5e9] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-lg shadow-[#38bdf8]/20 transition-all flex items-center justify-center gap-2 group"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing_Vector...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Initiate_Scan
                </>
              )}
            </button>
          </div>

          <div className="flex-1 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 text-center opacity-30">
             <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4">
                <Info className="w-6 h-6" />
             </div>
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scan History</div>
             <p className="text-[9px] text-slate-600 mt-2">AWAITING_NEW_INPUT_LOGS</p>
          </div>
        </div>

        {/* Results Pane */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-12"
              >
                <div className="relative">
                    <div className="w-32 h-32 border-2 border-[#38bdf8]/10 rounded-full animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 border-t-2 border-[#38bdf8] rounded-full animate-spin" />
                    </div>
                </div>
                <div className="space-y-4 text-center">
                    <h3 className="text-xl font-black uppercase tracking-[0.4em] text-white">Neural Researching</h3>
                    <div className="flex flex-col gap-2">
                        {["FETCHING_CROSS_REFERENCE_DATA", "AUDITING_DOMAIN_REPUTATION", "IDENTIFYING_LOGICAL_FALLACIES"].map((text, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.5 }}
                            className="text-[9px] font-mono text-[#38bdf8]/60 uppercase tracking-widest"
                          >
                            {"> "} {text}...
                          </motion.div>
                        ))}
                    </div>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div 
                 key="result"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar"
              >
                {/* Result Header */}
                <div className={cn(
                  "p-8 rounded-3xl border-2 backdrop-blur-xl flex items-center gap-6",
                  result.is_likely_fake 
                    ? "bg-rose-500/10 border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.1)]" 
                    : "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
                )}>
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center",
                      result.is_likely_fake ? "bg-rose-500/20 text-rose-500" : "bg-emerald-500/20 text-emerald-400"
                    )}>
                        {result.is_likely_fake ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                    </div>
                    <div>
                        <div className={cn(
                          "text-[10px] font-black uppercase tracking-widest mb-1",
                          result.is_likely_fake ? "text-rose-500" : "text-emerald-400"
                        )}>
                            INTELLIGENCE_VERDICT
                        </div>
                        <h2 className="text-3xl font-black text-white leading-none">
                            {result.is_likely_fake ? "FABRICATION_DETECTED" : "CREDIBLE_VITALITY"}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Reasoning Section */}
                    <div className="col-span-2 p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-slate-400 border-b border-white/5 pb-4">
                            <Info className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Verdict_Synthesis</span>
                        </div>
                        <p className="text-sm font-bold text-white leading-relaxed">{result.verdict_summary}</p>
                        <p className="text-xs text-slate-400 leading-relaxed">{result.reasoning}</p>
                    </div>

                    {/* Warning Signs */}
                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Warning_Flags</span>
                        </div>
                        <div className="space-y-3">
                            {(result.warning_signs || []).map((sign, i) => (
                                <div key={i} className="flex gap-3 text-xs">
                                    <div className="mt-1.5 w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                                    <span className="text-slate-400 leading-relaxed">{sign}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Intelligence Sources */}
                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                             <ExternalLink className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Validation_Nodes</span>
                        </div>
                        <div className="space-y-2">
                            {(result.sources || []).map((source, i) => (
                                <a 
                                  key={i} 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="group flex flex-col p-3 rounded-lg bg-black/40 border border-white/5 hover:border-[#38bdf8]/30 transition-all"
                                >
                                    <span className="text-[10px] text-white font-bold group-hover:text-[#38bdf8] transition-colors">{source.title}</span>
                                    <span className="text-[8px] font-mono text-slate-600 truncate mt-1">{source.url}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex-1 flex flex-col items-center justify-center gap-4 text-center max-w-sm mx-auto"
              >
                <div className="p-4 bg-rose-500/20 text-rose-500 rounded-full mb-2">
                  <AlertCircle className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-widest">Scan_Aborted</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-mono">{error}</p>
                <button 
                   onClick={() => setError(null)}
                   className="mt-4 px-6 py-2 border border-white/10 hover:border-[#38bdf8] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-all"
                >
                  Clear_Buffer
                </button>
              </motion.div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-30">
                    <ShieldCheck className="w-32 h-32 text-slate-600" />
                    <div className="text-center">
                        <h3 className="text-2xl font-black uppercase tracking-[0.4em] text-white">Truth Sentry</h3>
                        <p className="text-sm font-mono text-slate-500 mt-2 tracking-widest italic">AWAITING_CLAIM_FOR_RESEARCH</p>
                    </div>
                </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Subcomponents / Libs
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

function RefreshCw({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
        </svg>
    )
}
