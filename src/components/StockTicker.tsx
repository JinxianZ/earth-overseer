import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCcw, Search, X } from 'lucide-react';

interface StockQuote {
  symbol: string;
  price?: number;
  change?: number;
  changePercent?: number;
  currency?: string;
  error?: boolean;
}

const DEFAULT_SYMBOLS = ['MAERSK-B.CO', 'EVERGREEN.TW', 'ZIM', 'GLD', 'BRENT', 'AAPL', 'BTC-USD'];

export default function StockTicker() {
  const [symbols, setSymbols] = useState<string[]>(() => {
    const saved = localStorage.getItem('ticker-symbols');
    return saved ? JSON.parse(saved) : DEFAULT_SYMBOLS;
  });
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [newSymbol, setNewSymbol] = useState('');

  const fetchStocks = async () => {
    if (symbols.length === 0) {
      setStocks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = `/api/stocks?symbols=${symbols.join(',')}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok || !Array.isArray(data)) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      
      setStocks(data);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, [symbols]);

  useEffect(() => {
    localStorage.setItem('ticker-symbols', JSON.stringify(symbols));
  }, [symbols]);

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = newSymbol.trim().toUpperCase();
    if (sym && !symbols.includes(sym)) {
      setSymbols(prev => [...prev, sym]);
      setNewSymbol('');
    }
  };

  const handleRemoveSymbol = (sym: string) => {
    setSymbols(prev => prev.filter(s => s !== sym));
  };

  return (
    <div className="h-full flex flex-col bg-[var(--sidebar)] border-l border-[#334155] overflow-hidden text-white/90">
      <div className="p-4 border-b border-[#334155] flex justify-between items-center bg-white/5">
        <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#38bdf8] flex items-center gap-2">
          <TrendingUp className="w-3 h-3" /> TV_QUANT_MATRIX
        </h3>
        <button 
          onClick={fetchStocks}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          title="Refresh prices"
        >
          <RefreshCcw className={`w-3 h-3 text-[#94a3b8] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto font-sans">
        {error && (
          <div className="p-4 text-[10px] text-[#f23645] bg-[#f2364510] text-center italic border-b border-[#f2364520]">
            SYNC_FAILURE: {error}
          </div>
        )}
        
        {stocks.length === 0 && !loading && (
          <div className="p-8 text-center text-[10px] text-[#94a3b8] uppercase tracking-widest italic opacity-50">
            No active tickers tracked.
          </div>
        )}

        {(stocks || []).map((stock) => (
          <div 
            key={stock.symbol}
            className="p-4 border-b border-[#334155] hover:bg-white/5 transition-all group relative"
          >
            <button 
              onClick={() => handleRemoveSymbol(stock.symbol)}
              className="absolute right-2 top-2 p-1 text-[#94a3b8] opacity-0 group-hover:opacity-100 hover:text-[#f87171] transition-all"
            >
              <X className="w-3 h-3" />
            </button>
            
            <div className="flex justify-between items-baseline mb-1.5">
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-white group-hover:text-[#38bdf8] transition-colors leading-none">
                  {stock.symbol.split('.')[0]}
                </span>
                <span className="text-[8px] text-[#94a3b8] font-mono mt-1">{stock.currency || 'USD'}</span>
              </div>
              <div className="text-[14px] font-bold text-white tracking-tighter">
                {stock.error ? '---' : stock.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div className="flex justify-between items-end">
               <div className="flex items-center gap-2">
                 <div className="text-[8px] px-1 bg-white/5 rounded text-[#94a3b8] font-mono">
                    {stock.symbol.includes('.') ? stock.symbol.split('.')[1] : 'GLOBAL'}
                 </div>
               </div>
              {!stock.error && stock.change !== undefined && (
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                  stock.change >= 0 ? 'bg-[#22ab9420] text-[#34d399]' : 'bg-[#f2364520] text-[#f87171]'
                }`}>
                  {stock.change >= 0 ? '+' : ''}{Math.abs(stock.changePercent || 0).toFixed(2)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white/5 border-t border-[#334155]">
        <form onSubmit={handleAddSymbol} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94a3b8]" />
          <input 
            type="text" 
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            placeholder="Add Trading Ticker..." 
            className="w-full pl-8 pr-3 py-2 bg-[var(--sidebar)] border border-[#334155] rounded text-[10px] text-white focus:outline-none focus:border-[#38bdf8] transition-colors uppercase font-mono placeholder-[#64748b]"
          />
        </form>
        <div className="mt-3 flex items-center justify-between text-[8px] text-[#94a3b8] uppercase font-bold tracking-tighter">
          <span>Source: TV_MATRIX</span>
          <span>{lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}
