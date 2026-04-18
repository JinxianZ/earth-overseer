import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import yahooFinance from 'yahoo-finance2';
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log('[SERVER] Initializing Strategic Orchestrator backend...');

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Stock Price Endpoint
  app.get('/api/stocks', async (req, res) => {
    try {
      const symbols = (req.query.symbols as string || 'MAERSK-B.CO,EVERGREEN.TW,ZIM,GLD,BRENT').split(',');
      console.log('[API] Processing stock request for symbols:', symbols);
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const quote: any = await yahooFinance.quote(symbol);
            return {
              symbol,
              price: quote.regularMarketPrice,
              change: quote.regularMarketChange,
              changePercent: quote.regularMarketChangePercent,
              currency: quote.currency
            };
          } catch (e: any) {
            console.warn(`[API] Quote failed for ${symbol}:`, e.message);
            return { symbol, error: true };
          }
        })
      );
      res.json(results);
    } catch (error) {
      console.error('[API] Global stock fetch failure:', error);
      res.status(500).json({ error: 'Failed to fetch stock prices' });
    }
  });

  // Real-World Ship Tracking Proxy (MyShipTracking)
  app.get('/api/ships', async (req, res) => {
    const apiKey = process.env.MYSHIPTRACKING_API_KEY;
    
    // If we have an API key, we'd fetch from their actual endpoint
    // Documentation suggests: api.myshiptracking.com/api/v1/vessels?key=...
    if (apiKey) {
      try {
        const response = await fetch(`https://api.myshiptracking.com/api/v1/vessels?key=${apiKey}`);
        const data: any = await response.json();
        // transform data if needed
        return res.json(data);
      } catch (e) {
        console.error('External Ship API failed, falling back to simulation');
      }
    }

    // High-Fidelity Simulation (Failsafe)
    const shipNames = [
      'Maersk Eindhoven', 'Ever Given', 'ZIM Integrated', 'HMM Oslo', 
      'MSC Isabella', 'CMA CGM Rivoli', 'One Apus', 'Cosco Shipping Universe', 
      'MOL Triumph', 'Madrid Maersk', 'OOCL Hong Kong'
    ];
    const shipTypes: ('Cargo' | 'Tanker' | 'Container')[] = ['Cargo', 'Tanker', 'Container'];
    const destinations = ['Shanghai', 'Singapore', 'Rotterdam', 'Jebel Ali', 'Busan', 'Los Angeles', 'Hamburg'];
    
    const ships = Array.from({ length: 60 }).map((_, i) => ({
      id: `ship-${i}`,
      name: i < shipNames.length ? shipNames[i] : `Vessel_${1000 + i}`,
      type: shipTypes[i % 3],
      lat: (Math.random() * 120) - 60,
      lng: (Math.random() * 360) - 180,
      speed: 10 + Math.random() * 12,
      course: Math.random() * 360,
      destination: destinations[i % destinations.length],
      imo: 9000000 + i,
      last_update: new Date().toISOString()
    }));
    res.json(ships);
  });

  // Ports Layer Data
  app.get('/api/ports', (req, res) => {
    const ports = [
      { name: 'Shanghai (CN)', lat: 31.2, lng: 121.5, type: 'Port', throughput: '43.3M TEU' },
      { name: 'Singapore (SG)', lat: 1.3, lng: 103.8, type: 'Port', throughput: '37.2M TEU' },
      { name: 'Ningbo-Zhoushan (CN)', lat: 29.8, lng: 121.5, type: 'Port', throughput: '28.7M TEU' },
      { name: 'Shenzhen (CN)', lat: 22.5, lng: 114.1, type: 'Port', throughput: '25.7M TEU' },
      { name: 'Guangzhou (CN)', lat: 23.1, lng: 113.5, type: 'Port', throughput: '23.2M TEU' },
      { name: 'Busan (KR)', lat: 35.1, lng: 129.0, type: 'Port', throughput: '21.9M TEU' },
      { name: 'Qingdao (CN)', lat: 36.1, lng: 120.3, type: 'Port', throughput: '21.0M TEU' },
      { name: 'Hong Kong (HK)', lat: 22.3, lng: 114.2, type: 'Port', throughput: '18.3M TEU' },
      { name: 'Tianjin (CN)', lat: 39.0, lng: 117.2, type: 'Port', throughput: '17.3M TEU' },
      { name: 'Rotterdam (NL)', lat: 51.9, lng: 4.1, type: 'Port', throughput: '14.8M TEU' },
      { name: 'Jebel Ali (AE)', lat: 24.9, lng: 55.1, type: 'Port', throughput: '14.1M TEU' },
      { name: 'Los Angeles (US)', lat: 33.7, lng: -118.2, type: 'Port', throughput: '9.2M TEU' },
    ];
    res.json(ports);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
