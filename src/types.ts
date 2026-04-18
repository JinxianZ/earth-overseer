export interface GeopoliticalData {
  event: string;
  location: string;
  impact_score: number;
}

export interface CorporateScandals {
  company: string;
  allegation: string;
  market_cap_loss: string;
}

export interface MarketData {
  ticker: string;
  price: number;
  change_24h: number;
  volatility: number;
}

export interface LogisticsData {
  chokepoint: string;
  status: 'CLEAR' | 'CONGESTED' | 'BLOCKED';
  vessel_count: number;
}

export interface MacroInput {
  geopolitical_data: GeopoliticalData[];
  corporate_scandals: CorporateScandals[];
  market_data: MarketData[];
  logistics_data: LogisticsData[];
}

export interface MacroOutput {
  event_synthesis: string;
  arbitrage_opportunity: string;
  financial_execution: {
    action: 'LONG' | 'SHORT' | 'HEDGE' | 'HOLD';
    asset_ticker: string;
    entry_catalyst: string;
  };
  logistical_execution: {
    action: 'ACQUIRE' | 'DIVERT' | 'LIQUIDATE' | 'NONE';
    target_commodity: string | null;
    geographic_focus: string | null;
  };
  risk_exposure: string;
}
