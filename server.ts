import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import yahooFinance from 'yahoo-finance2';
import 'dotenv/config';

const yf = new (yahooFinance as any)();

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
            const quote: any = await yf.quote(symbol);
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
    
    const ships = Array.from({ length: 500 }).map((_, i) => ({
      id: `ship-${i}`,
      name: i < shipNames.length ? shipNames[i] : `Vessel_${1000 + i}`,
      type: shipTypes[i % 3],
      lat: (Math.random() * 140) - 70,
      lng: (Math.random() * 360) - 180,
      speed: 10 + Math.random() * 12,
      course: Math.random() * 360,
      destination: destinations[i % destinations.length],
      imo: 9000000 + i,
      last_sync: new Date(Math.floor(Date.now() / 600000) * 600000).toISOString()
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

  // Global News Feed
  app.get('/api/news', (req, res) => {
    const news = [
      { 
        id: 9, 
        title: "Tactical Update: Naval escorts mandatory in Strait of Hormuz per insurance mandates", 
        category: "GEOPOLITICAL", 
        severity: "HIGH", 
        timestamp: new Date().toISOString(),
        image: "https://picsum.photos/seed/hormuz/800/400"
      },
      { 
        id: 1, 
        title: "OPEC+ signals deeper production cuts amid slowing demand", 
        category: "ENERGY", 
        severity: "HIGH", 
        timestamp: new Date(Date.now() - 600000).toISOString(),
        image: "https://picsum.photos/seed/oil-rig/800/400"
      },
      { 
        id: 10, 
        title: "Panama Canal drought restricts deep-draft transit for container fleet", 
        category: "LOGISTICS", 
        severity: "MEDIUM", 
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        image: "https://picsum.photos/seed/canal/800/400"
      },
      { 
        id: 6, 
        title: "U.S. Senate debates new maritime technology subsidies and ESG frameworks", 
        category: "POLITICS", 
        severity: "MEDIUM", 
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        image: "https://picsum.photos/seed/capitol/800/400"
      },
      { 
        id: 7, 
        title: "European Union finalizes strict environmental shipping regulations for 2027", 
        category: "POLITICS", 
        severity: "HIGH", 
        timestamp: new Date(Date.now() - 2400000).toISOString(),
        image: "https://picsum.photos/seed/brussels-eu/800/400"
      },
      { 
        id: 3, 
        title: "Strategic grain reserves depleted in Southeast Asia after monsoons", 
        category: "COMMODITIES", 
        severity: "HIGH", 
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        image: "https://picsum.photos/seed/grain-silo/800/400"
      },
      { 
        id: 11, 
        title: "China's 'Belt and Road' logistics hub in Djibouti reaches full capacity", 
        category: "GEOPOLITICAL", 
        severity: "MEDIUM", 
        timestamp: new Date(Date.now() - 4200000).toISOString(),
        image: "https://picsum.photos/seed/port-crane/800/400"
      },
      { 
        id: 8, 
        title: "G7 leaders meet to discuss global infrastructure corridor security", 
        category: "POLITICS", 
        severity: "LOW", 
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        image: "https://picsum.photos/seed/leaders-meeting/800/400"
      }
    ];
    res.json(news);
  });

  // Critical Conflict Zones
  app.get('/api/conflicts', (req, res) => {
    const conflicts = [
      { id: 'c1', area: 'Red Sea Corridor', type: 'Maritime Security', threat_level: 'Critical', ships_affected: 45, detail: 'Ongoing Houthi drone swarms targeting commercial hulls.' },
      { id: 'c2', area: 'Persian Gulf', type: 'Oil Supply Chain', threat_level: 'High', ships_affected: 12, detail: 'Restricted transit near Strait of Hormuz due to naval drills.' },
      { id: 'c3', area: 'Black Sea', type: 'Grain Logistics', threat_level: 'Medium', ships_affected: 8, detail: 'Mine clearance operations active near corridor terminals.' },
      { id: 'c4', area: 'Gulf of Guinea', type: 'Anti-Piracy', threat_level: 'Medium', ships_affected: 5, detail: 'Boarding attempts reported near Nigeria EEZ boundary.' },
    ];
    res.json(conflicts);
  });

  // Corporate Intelligence (Scandals, Layoffs, Products)
  app.get('/api/corporate-intel', (req, res) => {
    const intel = [
      { 
        id: 1, 
        company: "Maersk", 
        category: "LAYOFFS", 
        title: "Strategic Headcount Realignment", 
        impact: "10,000 positions globally affected as AI-driven logistics nodes take over back-office operations.", 
        date: "2026-04-12" 
      },
      { 
        id: 2, 
        company: "Evergreen Marine", 
        category: "SCANDALS", 
        title: "Ecological Liability Probe", 
        impact: "Investigation launched into ballast water management protocols near sensitive biodiversity zones.", 
        date: "2026-04-15" 
      },
      { 
        id: 3, 
        company: "ZIM Integrated", 
        category: "PRODUCTS", 
        title: "Z-Shield Digital Matrix", 
        impact: "Launch of blockchain-verified trade compliance layer for handling high-risk cargo vectors.", 
        date: "2026-04-10" 
      },
      { 
        id: 4, 
        company: "Hapag-Lloyd", 
        category: "NEWS", 
        title: "Terminal Acquisition in Brazil", 
        impact: "Strategic expansion into Latin American logistics corridors to bypass central congestion points.", 
        date: "2026-04-14" 
      },
      { 
        id: 5, 
        company: "CMA CGM", 
        category: "SCANDALS", 
        title: "Sanction Evasion Allegations", 
        impact: "Regulatory audit of trans-shipment manifests at specific Free Trade Zones in the Middle East.", 
        date: "2026-04-16" 
      },
      { 
        id: 6, 
        company: "HMM", 
        category: "PRODUCTS", 
        title: "HMM Algeciras Gen-3", 
        impact: "Commissioning of the first fully autonomous 'Sailing Cloud' vessel for Trans-Pacific lanes.", 
        date: "2026-04-08" 
      }
    ];
    res.json(intel);
  });

  // Yahoo Finance / News Ingest
  app.get('/api/yahoo-ingest', async (req, res) => {
    try {
      const query = (req.query.q as string) || 'market';
      console.log('[API] Yahoo Ingest fetch for query:', query);
      
      // Fetch search results which include news
      const searchResults = await yf.search(query, { newsCount: 10 });
      
      // Fetch some general market indicators for context
      const indicators = await Promise.all([
        yf.quote('^GSPC'), // S&P 500
        yf.quote('^IXIC'), // Nasdaq
        yf.quote('CL=F'),   // Crude Oil
        yf.quote('GC=F'),   // Gold
      ]);

      const formattedIndicators = indicators.map(quote => ({
        symbol: quote.symbol,
        name: quote.shortName,
        price: quote.regularMarketPrice,
        changePercent: quote.regularMarketChangePercent,
      }));

      res.json({
        news: searchResults.news,
        indicators: formattedIndicators,
        quotes: searchResults.quotes
      });
    } catch (error: any) {
      console.error('[API] Yahoo Ingest failure:', error);
      res.status(500).json({ error: 'Failed to fetch Yahoo data', details: error.message });
    }
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
