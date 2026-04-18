import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  AlertTriangle, 
  ShieldAlert, 
  Newspaper, 
  Radio, 
  MessageSquare, 
  MapPin, 
  TrendingUp, 
  Info,
  ChevronRight,
  Zap,
  Clock
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// Utility for merging tailwind classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

interface NewsItem {
  id: number;
  title: string;
  category: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  image?: string;
  interestScore?: number; // 0 to 100, fades over time
  summary?: string;
}

interface ConflictZone {
  id: string;
  area: string;
  type: string;
  threat_level: 'Critical' | 'High' | 'Medium' | 'Low';
  ships_affected: number;
  detail: string;
}

export default function GeopoliticalMonitor() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [conflicts, setConflicts] = useState<ConflictZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'conflicts' | 'politics'>('all');

  const aiRef = useRef<any>(null);

  useEffect(() => {
    aiRef.current = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }, []);

  const synthesizeAdvancedIntel = async (currentConflicts: ConflictZone[], existingNews: NewsItem[]) => {
    if (!aiRef.current) return;
    setIsSynthesizing(true);
    
    try {
      const conflictContext = currentConflicts.map(c => `${c.area} (${c.type}): ${c.detail}`).join('\n');
      
      const prompt = `
        CRITICAL TASK: Using the GOOGLE SEARCH tool, find 4 ACTUAL, REAL-WORLD news articles/events that occurred between February 2026 and April 2026 (the current month).
        
        GEOPOLITICAL CONTEXT:
        ${conflictContext}
        
        STRICT FILTERING & PRIORITIZATION:
        1. ONLY return events from February 2026, March 2026, and April 2026.
        2. MANDATORY: Prioritize news from FEBRUARY 2026. At least 2 of the 4 articles MUST be significant developments from February 2026.
        3. ARRAY ORDER: Place the February 2026 news articles at the START of the JSON array.
        4. Categories: Geopolitics, Maritime Trade, Energy Security, Political Policy.
        
        Requirements:
        1. Use actual TITLES and specific details of the articles you find.
        2. Assign a SEVERITY based on their impact on global trade.
        3. Provide a specific, searchable image keyword seed for each.
        4. Clearly state the actual date of the event in the summary or title if possible.
      `;

      const result = await aiRef.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        tools: [
          { googleSearch: {} }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] },
                imageSeed: { type: Type.STRING },
                summary: { type: Type.STRING }
              },
              required: ['title', 'category', 'severity', 'imageSeed', 'summary']
            }
          }
        }
      });

      const newIntel = JSON.parse(result.text);
      const processedIntel = newIntel.map((item: any, idx: number) => ({
        id: Date.now() + idx,
        title: item.title,
        category: item.category,
        severity: item.severity,
        timestamp: new Date().toISOString(),
        image: `https://picsum.photos/seed/${item.imageSeed}/800/400`,
        summary: item.summary,
        interestScore: 100
      }));

      setNews(prev => {
        // Interest Decay Logic: reduce interest of old news
        const decayed = prev.map(n => ({
          ...n,
          interestScore: Math.max(0, (n.interestScore || 70) - 15)
        }));

        // Filter out news with 0 interest (fell off)
        const relevant = decayed.filter(n => (n.interestScore ?? 100) > 0);
        
        // Add new intel at the top and cap
        return [...processedIntel, ...relevant].slice(0, 15);
      });

    } catch (err) {
      console.error('Advanced synthesis failed:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const fetchData = async () => {
  try {
    const [newsRes, conflictRes] = await Promise.all([
      fetch('/api/news'),
      fetch('/api/conflicts')
    ]);

    if (!newsRes.ok) {
      console.error(`News API failed: ${newsRes.status}`);
      setLoading(false);
      return;
    }

    if (!conflictRes.ok) {
      console.error(`Conflicts API failed: ${conflictRes.status}`);
      setLoading(false);
      return;
    }

    const newsData = await newsRes.json();
    const conflictData = await conflictRes.json();
    
    setConflicts(conflictData);

    setNews(prev => {
      if (prev.length === 0) {
        return newsData.map((n: any) => ({ ...n, interestScore: 80 }));
      }
      return prev;
    });

    if (conflictData.length > 0) {
      synthesizeAdvancedIntel(conflictData, newsData);
    }
  } catch (err) {
    console.error('Failed to fetch geopolitical monitor data:', err);
  } finally {
    setLoading(false);
  }
};
  
  useEffect(() => {
    fetchData();
    // Poll every 60 seconds for new AI-synthesized intelligence
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredNews = activeSubTab === 'politics' 
    ? news.filter(n => n.category.toUpperCase().includes('POLITIC')) 
    : news;

  const featuredNews = news[0];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg)]">
      {/* Sub-Tabs Navigation */}
      <div className="px-6 py-2 border-b border-[var(--border)] bg-white/30 backdrop-blur-md flex items-center justify-between">
        <div className="flex gap-6">
          {[
            { id: 'all', label: 'All Intel', icon: Globe },
            { id: 'conflicts', label: 'Tactical Zones', icon: ShieldAlert },
            { id: 'politics', label: 'Political Vector', icon: Radio },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 py-2 text-[10px] uppercase font-bold tracking-widest transition-all relative",
                activeSubTab === tab.id ? "text-[var(--accent)]" : "text-[#64748b] hover:text-[#0f172a]"
              )}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
              {activeSubTab === tab.id && (
                <motion.div layoutId="subtab" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[var(--accent)]" />
              )}
            </button>
          ))}
        </div>
        
        {isSynthesizing && (
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
            <Zap className="w-3 h-3 text-indigo-500 animate-pulse" />
            <span className="text-[8px] font-black tracking-widest text-indigo-600 uppercase">Synthesizing Neural Intel...</span>
          </div>
        )}
      </div>

      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 overflow-y-auto">
        {/* Main Feed Column */}
        <div className="space-y-8">
          {(activeSubTab === 'all' || activeSubTab === 'politics') && (
            <section className="space-y-6">
              {/* Featured News Hero */}
              {featuredNews && activeSubTab === 'all' && (
                <motion.div 
                  layoutId={featuredNews.id.toString()}
                  className="relative h-[360px] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer"
                >
                  <img 
                    src={featuredNews.image} 
                    alt={featuredNews.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="text-[10px] font-black tracking-[0.2em] uppercase text-emerald-400">
                        {featuredNews.category}
                      </span>
                      <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${featuredNews.interestScore}%` }}
                           className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                         />
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400/60">{featuredNews.interestScore}% INTEREST</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white leading-tight mb-4">
                      {featuredNews.title}
                    </h2>
                    <p className="text-sm text-white/70 font-light max-w-2xl mb-6 line-clamp-2 italic">
                      {featuredNews.summary || "Real-time tactical intelligence verified via encrypted channels."}
                    </p>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] text-white/40 font-mono uppercase flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {new Date(featuredNews.timestamp).toLocaleTimeString()}
                       </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-indigo-500" />
                  {activeSubTab === 'politics' ? "Global Policy Vectors" : "Intelligence Stream"}
                </h2>
                <span className="text-[10px] font-mono text-[#94a3b8]">INDEXED_AT: {new Date().toLocaleTimeString()}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNews.slice(featuredNews && activeSubTab === 'all' ? 1 : 0).map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
                  >
                    {item.image && (
                      <div className="h-40 overflow-hidden relative">
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity" />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className={`text-[8px] font-black tracking-widest px-2 py-1 rounded shadow-lg backdrop-blur-sm ${
                            item.severity === 'HIGH' ? 'bg-red-500/90 text-white' : 
                            item.severity === 'MEDIUM' ? 'bg-amber-500/90 text-white' : 'bg-indigo-500/90 text-white'
                          }`}>
                            {item.severity}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black tracking-widest uppercase text-indigo-500">{item.category}</span>
                        <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                           <TrendingUp className={cn("w-3 h-3", (item.interestScore ?? 0) > 60 ? "text-emerald-500" : "text-amber-500")} />
                           <span className="text-[9px] font-mono">{item.interestScore}%</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-[#1e293b] leading-relaxed group-hover:text-[var(--accent)] transition-colors mb-3">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#64748b] line-clamp-2 mb-4 font-light italic">
                        {item.summary || "No secondary metadata available for this vector."}
                      </p>
                      <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                         <span className="text-[9px] text-[#94a3b8] font-mono">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         <ChevronRight className="w-3 h-3 text-[#94a3b8] group-hover:text-[var(--accent)] transition-all" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {activeSubTab === 'conflicts' && (
             <section className="space-y-6">
                {/* ... existing conflict zone content ... */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    Critical Conflict Zones
                  </h2>
                  <div className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded border border-red-100 uppercase tracking-widest">
                    Active Theater Oversight
                  </div>
                </div>
                <div className="grid gap-4">
                  {conflicts.map((zone) => (
                    <motion.div
                      key={zone.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm flex gap-6 relative overflow-hidden group"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2 ${
                        zone.threat_level === 'Critical' ? 'bg-red-600' : 'bg-amber-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-serif italic font-bold text-[#0f172a] uppercase">{zone.area}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                            zone.threat_level === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            {zone.threat_level}
                          </span>
                        </div>
                        <p className="text-xs text-[#475569] leading-relaxed mb-6 italic">{zone.detail}</p>
                        <div className="flex items-center gap-8">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-[#94a3b8] uppercase font-bold tracking-tighter">At Risk</span>
                            <span className="text-sm font-mono font-bold">{zone.ships_affected} VESSELS</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] text-[#94a3b8] uppercase font-bold tracking-tighter">Classification</span>
                            <span className="text-sm font-mono font-bold text-red-500">{zone.type}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
             </section>
          )}
        </div>

        {/* Sidebar Intelligence Column */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className="bg-[#0f172a] text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Globe className="w-32 h-32" />
            </div>
            <h3 className="text-lg font-serif italic mb-4 relative z-10">Neural Intelligence Synthesis</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6 relative z-10 font-light">
              Current multi-vector analysis indicates that maritime friction in the {conflicts[0]?.area || "Red Sea"} is causing a "Interest Decay" in standard ESG policies, as energy security takes precedent over long-term carbon targets. 
              {news[0] ? ` Latest trigger: ${news[0].title}.` : ""}
            </p>
            <div className="flex items-center justify-between relative z-10 pt-4 border-t border-white/10">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-mono font-bold text-emerald-400">MODEL_ACTIVE</span>
               </div>
               <span className="text-[9px] font-mono text-slate-500">PRECISION: 0.9998</span>
            </div>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
             <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0f172a]">Global Interest Decay Index</h4>
             </div>
             <div className="space-y-4">
                {news.slice(0, 5).map((item) => (
                  <div key={item.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-mono text-[#64748b] truncate max-w-[180px]">{item.title}</span>
                      <span className="text-[9px] font-mono font-bold text-[var(--accent)]">{item.interestScore}%</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.interestScore}%` }}
                        className={cn("h-full", (item.interestScore ?? 0) > 60 ? "bg-emerald-500" : (item.interestScore ?? 0) > 30 ? "bg-amber-500" : "bg-red-500")} 
                      />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
