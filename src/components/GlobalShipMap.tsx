import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Minimize2, Map, Layers, Anchor, Truck, Filter, Settings, X, ChevronRight, ChevronLeft, AlertTriangle, Zap } from 'lucide-react';

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

interface Port {
  name: string;
  lat: number;
  lng: number;
  type: string;
  throughput: string;
}

const MAJOR_CHOKEPOINTS = [
  { name: 'Suez Canal', lat: 29.9, lng: 32.5 },
  { name: 'Strait of Malacca', lat: 1.4, lng: 102.9 },
  { name: 'Panama Canal', lat: 9.1, lng: -79.9 },
  { name: 'Strait of Hormuz', lat: 26.6, lng: 56.3 },
  { name: 'English Channel', lat: 50.4, lng: -0.9 },
  { name: 'Bab-el-Mandeb', lat: 12.6, lng: 43.3 },
];

export default function GlobalShipMap({ isExpanded, onToggleExpand }: { isExpanded?: boolean, onToggleExpand?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [ships, setShips] = useState<Ship[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [hoveredEntity, setHoveredEntity] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Layer Toggles
  const [visibleLayers, setVisibleLayers] = useState({
    cargo: true,
    tanker: true,
    container: true,
    ports: true,
    chokepoints: true
  });

  // Load static data (map + ports)
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(data => {
        setWorldData(topojson.feature(data, data.objects.countries));
      });

    fetch('/api/ports')
      .then(res => res.json())
      .then(setPorts);
  }, []);

  // Fetch Real-World (Proxied) Ships
  const fetchShips = async () => {
    try {
      const res = await fetch('/api/ships');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setShips(data);
    } catch (err: any) {
      console.error('Failed to fetch ships:', err.message);
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
    
    const serverInterval = setInterval(fetchShips, 45000); 
    return () => {
      clearInterval(interval);
      clearInterval(serverInterval);
    };
  }, []);

  // Map Rendering with Zoom/Drag
  useEffect(() => {
    if (!worldData || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const projection = d3.geoMercator()
      .scale(isExpanded ? width / 5 : width / 6.5)
      .translate([width / 2, height / (isExpanded ? 1.6 : 1.5)]);

    const path = d3.geoPath().projection(projection);

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Draw Countries
    g.selectAll('path')
      .data(worldData.features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('fill', '#1e293b')
      .attr('stroke', '#334155')
      .attr('stroke-width', isExpanded ? 0.3 : 0.5);

    // Filter ships based on toggles
    const filteredShips = ships.filter(ship => {
      if (ship.type === 'Cargo' && !visibleLayers.cargo) return false;
      if (ship.type === 'Tanker' && !visibleLayers.tanker) return false;
      if (ship.type === 'Container' && !visibleLayers.container) return false;
      return true;
    });

    // Draw Chokepoints
    if (visibleLayers.chokepoints) {
      const chokeNodes = g.selectAll('.chokepoint')
        .data(MAJOR_CHOKEPOINTS)
        .enter()
        .append('g')
        .attr('class', 'chokepoint');

      chokeNodes.append('circle')
        .attr('cx', d => projection([d.lng, d.lat])![0])
        .attr('cy', d => projection([d.lng, d.lat])![1])
        .attr('r', isExpanded ? 5 : 3)
        .attr('fill', 'rgba(239, 68, 68, 0.4)')
        .attr('stroke', 'rgba(239, 68, 68, 0.8)')
        .attr('stroke-width', 1)
        .on('mouseover', (event, d) => setHoveredEntity({ ...d, type: 'Strategic Chokepoint' }))
        .on('mouseout', () => setHoveredEntity(null));
    }

    // Draw Ports
    if (visibleLayers.ports) {
      const portNodes = g.selectAll('.port')
        .data(ports)
        .enter()
        .append('g')
        .attr('class', 'port');

      portNodes.append('path')
        .attr('d', d3.symbol().type(d3.symbolSquare).size(isExpanded ? 30 : 20) as any)
        .attr('transform', (d: Port) => `translate(${projection([d.lng, d.lat])![0]}, ${projection([d.lng, d.lat])![1]})`)
        .attr('fill', '#6366f1')
        .attr('opacity', 0.8)
        .on('mouseover', (event, d: Port) => setHoveredEntity(d))
        .on('mouseout', () => setHoveredEntity(null));
    }

    // Draw Ships
    const shipLayer = g.append('g').attr('class', 'ships');
    
    shipLayer.selectAll('circle.ship')
      .data(filteredShips, (d: any) => d.id)
      .enter()
      .append('circle')
      .attr('class', 'ship')
      .attr('r', isExpanded ? 2.8 : 1.5)
      .attr('fill', (d: Ship) => d.type === 'Tanker' ? '#f59e0b' : d.type === 'Container' ? '#3b82f6' : '#10b981')
      .attr('cx', (d: Ship) => projection([d.lng, d.lat])![0])
      .attr('cy', (d: Ship) => projection([d.lng, d.lat])![1])
      .on('mouseover', (event, d: Ship) => setHoveredEntity(d))
      .on('mouseout', () => setHoveredEntity(null));

  }, [worldData, ships, ports, visibleLayers, isExpanded]);

  return (
    <div ref={containerRef} className={cn(
      "relative overflow-hidden bg-[#0f172a] rounded-md border border-[var(--border)] group transition-all duration-500",
      isExpanded ? "fixed inset-8 z-[100] shadow-2xl" : "w-full h-full"
    )}>
      <svg 
        ref={svgRef} 
        className="w-full h-full cursor-move bg-[#0f172a]"
      />
      
      {/* Overlay: Header Stats */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-3 px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase">AIS_LIVE_MATRIX</span>
          <div className="w-px h-3 bg-white/20" />
          <span className="text-[10px] text-emerald-400 font-mono">PROXY_ACTIVE</span>
        </div>
      </div>

      {/* Floating Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button 
          onClick={onToggleExpand}
          className="p-2.5 bg-black/60 hover:bg-black/80 border border-white/10 rounded-lg text-white transition-all backdrop-blur-md shadow-xl"
          title={isExpanded ? "Minimize" : "Maximize View"}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-2.5 border rounded-lg transition-all backdrop-blur-md shadow-xl",
            showFilters ? "bg-white text-black border-white" : "bg-black/60 text-white border-white/10 hover:bg-black/80"
          )}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 200, opacity: 0 }}
            className="absolute top-4 right-16 w-56 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-xl p-4 shadow-3xl text-white"
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <h4 className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                <Filter className="w-3 h-3" /> Visual Layers
              </h4>
              <button onClick={() => setShowFilters(false)} className="hover:text-red-400">
                <X className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-3">
              {[
                { key: 'cargo', label: 'Cargo Vessels', icon: Truck, color: 'bg-[#10b981]' },
                { key: 'tanker', label: 'Oil Tankers', icon: Zap, color: 'bg-[#f59e0b]' },
                { key: 'container', label: 'Containers', icon: Layers, color: 'bg-[#3b82f6]' },
                { key: 'ports', label: 'Commercial Ports', icon: Anchor, color: 'bg-[#6366f1]' },
                { key: 'chokepoints', label: 'Strategic Straits', icon: AlertTriangle, color: 'bg-red-500' },
              ].map((layer: any) => (
                <label key={layer.key} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-1.5 h-1.5 rounded-full", layer.color)} />
                    <span className="text-[10px] uppercase font-mono tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                      {layer.label}
                    </span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={(visibleLayers as any)[layer.key]}
                    onChange={() => setVisibleLayers(prev => ({ ...prev, [layer.key]: !(prev as any)[layer.key] }))}
                    className="accent-white w-3 h-3 rounded bg-transparent border-white/20"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-[8px] opacity-40 uppercase tracking-tighter leading-tight">
                  Source: MyShipTracking API v1.0<br/>
                  AIS Refresh: 3s Dynamic | 45s Sync
                </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entity Tooltip / Info Card */}
      <AnimatePresence>
        {hoveredEntity && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={cn(
              "absolute p-4 bg-[#1e293b]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] pointer-events-none z-[110]",
              isExpanded ? "bottom-8 left-8 w-72" : "bottom-12 left-4 right-4"
            )}
          >
            <div className="flex justify-between items-start mb-2">
               <div className="flex flex-col">
                 <span className="text-xs font-black text-white leading-tight uppercase tracking-tight">{hoveredEntity.name}</span>
                 <span className="text-[9px] text-[#94a3b8] font-mono tracking-tighter italic">#{hoveredEntity.imo || hoveredEntity.type}</span>
               </div>
               <span className={cn(
                 "text-[9px] px-2 py-0.5 rounded-md font-bold uppercase",
                 hoveredEntity.type === 'Tanker' ? "bg-amber-500/20 text-amber-400" : 
                 hoveredEntity.type === 'Container' ? "bg-blue-500/20 text-blue-400" :
                 hoveredEntity.type === 'Cargo' ? "bg-emerald-500/20 text-emerald-400" :
                 "bg-indigo-500/20 text-indigo-400"
               )}>
                 {hoveredEntity.type}
               </span>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 border-t border-white/5 pt-3">
               <div className="flex flex-col">
                  <span className="text-[8px] text-[#64748b] uppercase font-black mb-0.5">Location</span>
                  <span className="text-[10px] text-white font-mono">{hoveredEntity.lat.toFixed(3)}N, {hoveredEntity.lng.toFixed(3)}E</span>
               </div>
               {hoveredEntity.speed !== undefined && (
                 <div className="flex flex-col">
                    <span className="text-[8px] text-[#64748b] uppercase font-black mb-0.5">Telemetry</span>
                    <span className="text-[10px] text-white font-mono">{hoveredEntity.speed.toFixed(1)} KN @ {hoveredEntity.course.toFixed(0)}°</span>
                 </div>
               )}
               {hoveredEntity.throughput && (
                 <div className="flex flex-col col-span-2">
                    <span className="text-[8px] text-[#64748b] uppercase font-black mb-0.5">Stat / Throughput</span>
                    <span className="text-[10px] text-indigo-300 font-mono">{hoveredEntity.throughput} (ANNUAL)</span>
                 </div>
               )}
               {hoveredEntity.destination && (
                 <div className="flex flex-col col-span-2">
                    <span className="text-[8px] text-[#64748b] uppercase font-black mb-0.5">Bound To</span>
                    <span className="text-[10px] text-white font-mono truncate">{hoveredEntity.destination}</span>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coordinate HUD */}
      {!isExpanded && (
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/30 rounded text-[7px] font-mono text-white/30 uppercase tracking-widest">
          SENS_0.4 | LVL_GLOB | DRAG_ENABLED
        </div>
      )}
    </div>
  );
}

// Utility
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
