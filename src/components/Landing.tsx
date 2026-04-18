import React from 'react';
import { motion } from 'motion/react';
import { Globe, ShieldCheck, Zap, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-20" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl w-full text-center space-y-8"
      >
        <div className="flex justify-center">
            <div className="relative">
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 border border-sky-500/30 rounded-full scale-150"
                />
                <div className="w-24 h-24 bg-sky-500/10 rounded-full flex items-center justify-center border border-sky-500/20 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                   <Globe className="w-12 h-12 text-sky-400" />
                </div>
            </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">
            NODE<span className="text-sky-500">04</span>
          </h1>
          <p className="text-slate-400 text-lg font-light tracking-wide max-w-md mx-auto">
            Strategic Multimodal Intelligence Node. Ingest global risk. Project future impact. Maintain the Truth.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 py-8">
           {[
             { icon: ShieldCheck, label: "Verified Intel" },
             { icon: Zap, label: "Predictive Labs" },
             { icon: Lock, label: "Secure Nexus" }
           ].map((item, i) => (
             <div key={i} className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                <item.icon className="w-5 h-5 text-sky-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
             </div>
           ))}
        </div>

        <button 
          onClick={signIn}
          className="group relative px-12 py-5 bg-sky-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(14,165,233,0.3)]"
        >
          Initialize Command Session
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" />
        </button>

        <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest pt-8">
           SYSTEM_VER: 4.2.0-STABLE | PROJECT_SKYNET_INITIATED
        </div>
      </motion.div>
    </div>
  );
}
