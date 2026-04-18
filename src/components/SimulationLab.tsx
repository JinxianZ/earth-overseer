import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Terminal, 
  Cpu, 
  Zap, 
  RefreshCw, 
  TrendingUp, 
  ShieldAlert, 
  ChevronRight,
  Database,
  Layers,
  Activity,
  AlertCircle,
  Save,
  Archive,
  FileText,
  Trash2
} from 'lucide-react';
import { projectFutureState, FutureProjection } from '../geminiService';
import { MacroInput } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

// Helper for tailwind class merging
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

interface SimulationLabProps {
  input: MacroInput;
  theme: string;
}

export default function SimulationLab({ input, theme }: SimulationLabProps) {
  const [timeHorizon, setTimeHorizon] = useState(0);
  const [projection, setProjection] = useState<FutureProjection | null>(null);
  const [isProjecting, setIsProjecting] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [archives, setArchives] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'simulations'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setArchives(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [simLogs]);

  const addSimLog = (msg: string) => {
    setSimLogs(prev => [...prev.slice(-15), `[SIM_${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runSimulation = async (h: number) => {
    setTimeHorizon(h);
    if (h === 0) {
      setProjection(null);
      setSimLogs([]);
      return;
    }

    setIsProjecting(true);
    setProjection(null);
    setSimLogs([]);
    
    addSimLog("Initializing Predictive Kernel...");
    addSimLog(`Setting Temporal Horizon to T+${h}h...`);
    
    // Fake process steps for visual "simulation" feel
    const steps = [
      "Accessing global maritime telemetry...",
      "Synthesizing geopolitical stress vectors...",
      "Mapping corporate liability contagion...",
      "Projecting second-order market impact...",
      "Synchronizing probability matrices..."
    ];

    try {
      for (const step of steps) {
        await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
        addSimLog(step);
      }

      const result = await projectFutureState(input, h);
      
      // Add the AI's internal reasoning steps to the logs
      if (result.reasoning) {
        for (const r of result.reasoning) {
          await new Promise(r => setTimeout(r, 400));
          addSimLog(`NEURAL_LOG: ${r}`);
        }
      }

      setProjection(result);
      addSimLog("Simulation Locked. Finalizing projection.");
    } catch (err) {
      addSimLog("CRITICAL_ERROR: Projection sequence interrupted.");
    } finally {
      setIsProjecting(false);
    }
  };

  const saveSimulation = async () => {
    if (!projection || !user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'simulations'), {
        userId: user.uid,
        horizon: timeHorizon,
        ...projection,
        createdAt: serverTimestamp()
      });
      addSimLog("INTEGRITY_CHECK: Scenario committed to archives.");
    } catch (err) {
      addSimLog("ERROR: Data persistence failure.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSimulation = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'simulations', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[var(--bg)] transition-colors duration-500">
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full space-y-12">
          
          {/* Header */}
          <header className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--accent)] text-black rounded-lg">
                  <RefreshCw className={cn("w-6 h-6", isProjecting && "animate-spin")} />
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-[var(--text-main)] transition-colors">
                  Predictive Simulation Lab
                </h1>
              </div>
              <p className="text-[var(--text-muted)] text-sm font-light italic">
                Advanced temporal analysis for second-order macroeconomic contagion.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-[var(--card-bg)] px-6 py-4 rounded-2xl border border-[var(--border)] shadow-xl">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Node Status</span>
                <span className={cn("text-xs font-bold", isProjecting ? "text-[var(--accent)] animate-pulse" : "text-emerald-500")}>
                  {isProjecting ? "PROJECTING_TIMELINE" : "AWAITING_HORIZON_INPUT"}
                </span>
              </div>
              <Database className="w-5 h-5 text-[var(--accent)]" />
            </div>
          </header>

          {/* Temporal Control Console */}
          <section className="bg-[var(--sidebar)] p-8 rounded-3xl border border-[var(--border)] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                <Clock className="w-48 h-48" />
             </div>
             
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-center">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Temporal Horizon Offset
                    </label>
                    <div className="text-4xl font-mono font-black text-[var(--text-main)] italic">
                      {timeHorizon === 0 ? "NOW" : `T + ${timeHorizon}H`}
                    </div>
                  </div>

                  <div className="flex items-center gap-8 h-48">
                    <div className="relative h-full flex items-center">
                      <input 
                        type="range" 
                        min="0" 
                        max="168" 
                        step="24"
                        value={timeHorizon} 
                        onChange={(e) => runSimulation(Number(e.target.value))}
                        disabled={isProjecting}
                        style={{ 
                          appearance: 'slider-vertical',
                          WebkitAppearance: 'slider-vertical',
                          width: '8px',
                          height: '100%'
                        } as any}
                        className="bg-[var(--faint)] rounded-full cursor-pointer hover:bg-[var(--well)] transition-all accent-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="flex flex-col justify-between h-full text-[9px] font-bold text-slate-500 uppercase py-1">
                      {['Present', '24h', '48h', '72h', '96h', '120h', '144h', '1wk'].map((label, i) => (
                        <div key={label} className={cn("flex items-center gap-2", timeHorizon === i * 24 && "text-[var(--text-main)]")}>
                           <div className={cn("w-2 h-[1px] bg-slate-700", timeHorizon === i * 24 && "bg-[var(--accent)] w-3")} />
                           {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Terminal className="w-3 h-3" />
                      Simulation Kernel Output
                   </div>
                   <div 
                    ref={scrollRef}
                    className="h-32 bg-[var(--well)] rounded-2xl border border-[var(--border)] p-4 font-mono text-[10px] space-y-1 overflow-y-auto scrollbar-hide shadow-inner"
                   >
                      {simLogs.length === 0 ? (
                        <div className="text-slate-700 animate-pulse italic">_ Awaiting horizon selection to initialize simulation...</div>
                      ) : (
                        simLogs.map((log, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -5 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                              log.includes("ERROR") ? "text-red-500" : 
                              log.includes("NEURAL") ? "text-[var(--accent)]" : "text-slate-400"
                            )}
                          >
                            {log}
                          </motion.div>
                        ))
                      )}
                      {isProjecting && (
                        <motion.div 
                          animate={{ opacity: [0, 1] }} 
                          transition={{ repeat: Infinity, duration: 0.5 }}
                          className="w-2 h-3 bg-[var(--accent)] inline-block ml-1" 
                        />
                      )}
                   </div>
                </div>
             </div>
          </section>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {projection ? (
              <motion.section 
                key="results"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Main Insight Card */}
                <div className="lg:col-span-2 space-y-8">
                   <div className="bg-[var(--card-bg)] p-10 rounded-[2.5rem] border border-[var(--border)] shadow-2xl space-y-8 relative overflow-hidden group">
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-8 bg-[var(--accent)] rounded-full" />
                           <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--accent)]">Projection Result</span>
                        </div>
                        <button 
                          onClick={saveSimulation}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-4 py-2 bg-[var(--glass)] hover:bg-[var(--accent)] hover:text-black text-[10px] font-black uppercase tracking-widest rounded-xl border border-[var(--border)] transition-all disabled:opacity-50"
                        >
                          {isSaving ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Save className="w-3 h-3" />
                          )}
                          Save to Archives
                        </button>
                      </div>

                     {/* Confidence Meter Overlay */}
                     <div className="absolute top-0 right-0 p-8 flex flex-col items-center">
                        <div className="relative w-20 h-20">
                           <svg className="w-full h-full transform -rotate-90">
                              <circle 
                                cx="40" cy="40" r="36" 
                                className="stroke-[var(--border)] fill-none" 
                                strokeWidth="6" 
                              />
                              <motion.circle 
                                cx="40" cy="40" r="36" 
                                className="stroke-[var(--accent)] fill-none" 
                                strokeWidth="6"
                                strokeDasharray={226}
                                initial={{ strokeDashoffset: 226 }}
                                animate={{ strokeDashoffset: 226 - (226 * projection.probability) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                              />
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-lg font-black text-[var(--text-main)]">{Math.round(projection.probability * 100)}%</span>
                              <span className="text-[7px] font-black uppercase tracking-tighter text-slate-500">Likely</span>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full border border-[var(--accent)]/20">
                            Projection: T+{timeHorizon}h
                          </span>
                        </div>
                        <h2 className="text-4xl font-black text-[var(--text-main)] italic leading-[1.1] uppercase tracking-tight">
                          {projection.headline}
                        </h2>
                        <div className="p-6 bg-[var(--glass)] rounded-2xl border border-[var(--border)] space-y-3">
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                             <Zap className="w-3 h-3" /> Neural Logic Breakdown
                           </div>
                           <p className="text-base text-[var(--text-main)] font-light leading-relaxed italic opacity-80">
                             {projection.detailed_explanation}
                           </p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[var(--border)]">
                        <div className="space-y-3">
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                              <TrendingUp className="w-3 h-3" /> Market Impact
                           </div>
                           <p className="text-sm font-bold text-[var(--text-main)] opacity-70 leading-snug">{projection.market_impact}</p>
                        </div>
                        <div className="space-y-3">
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500">
                              <ShieldAlert className="w-3 h-3" /> Geopolitical Shift
                           </div>
                           <p className="text-sm font-bold text-[var(--text-main)] opacity-70 leading-snug">{projection.geopolitical_shift}</p>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Tactical Recommendation Sidebar */}
                <div className="space-y-6">
                   <div className="bg-[var(--sidebar)] p-8 rounded-[2rem] border border-[var(--border)] shadow-xl space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                           <ShieldAlert className="w-5 h-5 text-amber-500" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-main)]">Hedge Protocol</h3>
                      </div>
                      <div className="p-6 bg-amber-500/5 rounded-2xl border border-amber-500/20">
                        <p className="text-xs font-bold text-amber-200 leading-relaxed italic">
                          {projection.recommended_hedge}
                        </p>
                      </div>
                      <button className="w-full py-4 bg-[var(--accent)] text-black text-xs font-black uppercase tracking-widest rounded-xl shadow-lg hover:scale-[1.02] transition-transform active:scale-95">
                        Initialize Tactical Buy
                      </button>
                   </div>

                   <div className="bg-[var(--card-bg)] p-8 rounded-[2rem] border border-[var(--border)] shadow-md space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                         <Activity className="w-3 h-3" /> System Confidence Info
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-slate-400">Entropy Level</span>
                          <span className="text-emerald-500">LOW</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-slate-400">Grounding Score</span>
                          <span className="text-white">0.962</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-slate-400">Context Window</span>
                          <span className="text-white">FULL</span>
                        </div>
                      </div>
                   </div>
                </div>
              </motion.section>
            ) : !isProjecting && timeHorizon === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-32 h-32 bg-[var(--sidebar)] rounded-full border border-[var(--border)] flex items-center justify-center relative shadow-inner">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-t-2 border-[var(--accent)] rounded-full opacity-50"
                  />
                  <Clock className="w-12 h-12 text-slate-700" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-bold text-[var(--text-main)]">Awaiting Temporal Coordinates</h3>
                  <p className="text-[var(--text-muted)] text-sm font-light">
                    Adjust the slider to initialize a multi-vector AI simulation of future market and geopolitical conditions.
                  </p>
                </div>
              </div>
            ) : null}
          </AnimatePresence>

          <section className="space-y-6 pt-12 border-t border-[var(--border)]">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <Archive className="w-5 h-5 text-slate-500" />
                   <h2 className="text-xl font-black uppercase tracking-tight text-white">Neural Archives</h2>
                </div>
                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{archives.length} Entries Recovered</span>
             </div>

             {archives.length === 0 ? (
               <div className="p-12 border-2 border-dashed border-[var(--border)] rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4">
                  <FileText className="w-12 h-12 text-[var(--accent)] opacity-20" />
                  <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">No historical tactical projections found.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {archives.map((sim) => (
                    <motion.div 
                      key={sim.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group p-6 bg-[var(--well)] rounded-3xl border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all flex flex-col gap-4 relative"
                    >
                       <div className="flex justify-between items-start">
                          <div className="px-2 py-0.5 bg-[var(--accent)] text-black text-[8px] font-black uppercase rounded">
                             T + {sim.horizon}h
                          </div>
                          <button 
                            onClick={() => deleteSimulation(sim.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                          >
                             <Trash2 className="w-3.5 h-3.5" />
                          </button>
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white leading-tight line-clamp-2 uppercase italic">{sim.headline}</h4>
                          <p className="text-[10px] text-slate-400 font-mono tracking-tight capitalize">
                             {sim.createdAt?.toDate ? new Date(sim.createdAt.toDate()).toLocaleDateString() : 'REAL_TIME'}
                          </p>
                       </div>
                       <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-bold">
                          <span className={cn(
                            sim.probability > 0.7 ? "text-emerald-500" : "text-amber-500"
                          )}>
                             P: {Math.round(sim.probability * 100)}%
                          </span>
                          <button 
                            onClick={() => {
                              setProjection(sim as any);
                              setTimeHorizon(sim.horizon);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-[var(--accent)] hover:underline flex items-center gap-1"
                          >
                             RE_INITIALIZE <ChevronRight className="w-3 h-3" />
                          </button>
                       </div>
                    </motion.div>
                  ))}
               </div>
             )}
          </section>
        </div>
      </div>
    </div>
  );
}
