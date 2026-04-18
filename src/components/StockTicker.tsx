import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCcw, Search } from 'lucide-react';

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
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/stocks?symbols=${DEFAULT_SYMBOLS.join(',')}`;
      console.log('[STOCK] Fetching from:', url);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setStocks(data);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('[STOCK] Fetch failed:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-white border-l border-[var(--border)] overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[#f8fafc]">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
          <TrendingUp className="w-3 h-3" /> Market Ticker
        </h3>
        <button 
          onClick={fetchStocks}
          className="p-1 hover:bg-slate-200 rounded transition-colors"
          title="Refresh prices"
        >
          <RefreshCcw className={`w-3 h-3 text-[var(--text-muted)] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto font-mono">
        {error && (
          <div className="p-4 text-[10px] text-[var(--danger)] bg-red-50 text-center italic">
            Connection Interrupted: {error}
          </div>
        )}
        {stocks.map((stock) => (
          <div 
            key={stock.symbol}
            className="p-3 border-b border-[var(--border)] hover:bg-slate-50 transition-colors group cursor-default"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-[#0f172a] group-hover:text-[var(--accent)] transition-colors">
                {stock.symbol.split('.')[0]}
              </span>
              <span className="text-[9px] opacity-40 uppercase">{stock.currency || 'USD'}</span>
            </div>
            
            <div className="flex justify-between items-end">
              <div className="text-[13px] font-bold text-[#1e293b]">
                {stock.error ? 'ERR' : stock.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {!stock.error && stock.change !== undefined && (
                <div className={`flex items-center gap-1 text-[10px] font-bold ${stock.change >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                  {stock.change >= 0 ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
                  {Math.abs(stock.changePercent || 0).toFixed(2)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-[#f1f5f9] border-t border-[var(--border)]">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Add Ticker..." 
            className="w-full pl-7 pr-2 py-1.5 bg-white border border-[var(--border)] rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
        <div className="mt-2 text-[8px] text-[var(--text-muted)] uppercase tracking-tighter text-center">
          Last Sync: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
