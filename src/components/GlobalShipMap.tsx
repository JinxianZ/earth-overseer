import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface Ship {
  id: string;
  name: string;
  type: 'Cargo' | 'Tanker' | 'Container';
  lat: number;
  lng: number;
  speed: number;
  course: number;
  destination: string;
  imo?: number;
}

// MarineTraffic Iframe Embed Constants
const MT_IFRAME_BASE = "https://www.marinetraffic.com/en/ais/embed";
const MT_PARAMS = "centerx:-40.6/centery:0/zoom:2/maptype:2/shownames:true/mmsi:0/shipid:0/fleet:/showmenu:false/shiptype:0/showtrack:false/msg_id:0/vessel:0/container:true/";

export default function GlobalShipMap({ isExpanded, onToggleExpand }: { isExpanded?: boolean, onToggleExpand?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Real-World (Proxied) Ships for the data link (keeping it connected to back-end)
  const fetchShips = async () => {
    try {
      const res = await fetch('/api/ships');
      const data = await res.json();
      setShips(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch ships:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShips();
    const interval = setInterval(() => {
      setShips(prev => prev.map(ship => {
        const rad = (ship.course * Math.PI) / 180;
        const dLat = (ship.speed / 50000) * Math.cos(rad);
        const dLng = (ship.speed / 50000) * Math.sin(rad);
        return { ...ship, lat: ship.lat + dLat, lng: ship.lng + dLng };
      }));
    }, 1000);
    
    const serverInterval = setInterval(fetchShips, 600000); // 10 minute update
    return () => {
      clearInterval(interval);
      clearInterval(serverInterval);
    };
  }, []);

  return (
    <motion.div 
      ref={containerRef} 
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "relative overflow-hidden bg-[#0f172a] rounded-md border border-[var(--border)] group w-full h-full"
      )}
    >
      {/* Live MarineTraffic Feed */}
      <iframe 
        src={`${MT_IFRAME_BASE}/${MT_PARAMS}`}
        className="w-full h-full border-none opacity-80 group-hover:opacity-100 transition-opacity"
        referrerPolicy="no-referrer"
        title="Live Global AIS Maritime Feed"
        allowFullScreen
      />
      
      {/* Overlay: Header Stats */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-3 px-3 py-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase">AIS_LIVE_MATRIX</span>
          <div className="w-px h-3 bg-white/25" />
          <span className="text-[10px] text-emerald-400 font-mono tracking-tighter">DATA_SOURCE: MARINETRAFFIC_REAL_POSITIONAL</span>
        </div>
      </div>

      {/* Coordinate HUD */}
      {!isExpanded && (
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[7px] font-mono text-white/50 uppercase tracking-widest">
          SENS_AUTO | REFRESH_10M | MT_API_CONNECTED
        </div>
      )}
    </motion.div>
  );
}

// Utility
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
