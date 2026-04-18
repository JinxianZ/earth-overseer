import { MacroInput, MacroOutput } from "./types";
import { Type } from "@google/genai";

const SYSTEM_PROMPT = `You are the Orchestrator Node of a global macroeconomic arbitrage and risk network. Your objective is to ingest multimodal global data feeds, identify geopolitical, environmental, and corporate anomalies, and output actionable arbitrage strategies for financial and logistical profit.

**Operating Parameters:**
1. You will receive user input as a JSON payload containing:
   - \`geopolitical_data\`: Armed conflicts, civil unrest, trade embargoes, sovereign defaults.
   - \`corporate_scandals\`: Executive arrests, fraud allegations, regulatory crackdowns, product recalls.
   - \`market_data\`: Equities, commodities futures, currency pairs, options volatility.
   - \`logistics_data\`: Supply chain chokepoints, maritime routing vectors, port statuses.
2. Analyze intersecting vectors. Determine the primary and secondary market impacts of the reported events.
3. Implement strict execution logic:
   - If a high-impact corporate scandal is detected, identify immediate short-selling targets or competitor long positions.
   - If a geographical conflict intersects a major supply route, calculate commodity price spikes and recommend futures contracts or alternative supplier acquisition.
4. Do not hallucinate data. Base calculations strictly on the provided JSON variables.

**Output Format:**
Respond ONLY with a valid JSON object matching the schema. Do not include markdown formatting or conversational text.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    event_synthesis: { type: Type.STRING },
    arbitrage_opportunity: { type: Type.STRING },
    financial_execution: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, description: "LONG | SHORT | HEDGE | HOLD" },
        asset_ticker: { type: Type.STRING },
        entry_catalyst: { type: Type.STRING }
      },
      required: ["action", "asset_ticker", "entry_catalyst"]
    },
    logistical_execution: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, description: "ACQUIRE | DIVERT | LIQUIDATE | NONE" },
        target_commodity: { type: Type.STRING, nullable: true },
        geographic_focus: { type: Type.STRING, nullable: true }
      },
      required: ["action", "target_commodity", "geographic_focus"]
    },
    risk_exposure: { type: Type.STRING }
  },
  required: ["event_synthesis", "arbitrage_opportunity", "financial_execution", "logistical_execution", "risk_exposure"]
};

export async function analyzeMacroRisk(input: MacroInput): Promise<MacroOutput> {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: JSON.stringify(input, null, 2),
      systemInstruction: SYSTEM_PROMPT,
      responseSchema: RESPONSE_SCHEMA
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "AI Analysis Failed");
  }
  
  return response.json();
}

export interface GeopoliticalIntel {
  title: string;
  category: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  imageSeed: string;
  summary: string;
}

export async function synthesizeGeopoliticalIntel(context: string): Promise<GeopoliticalIntel[]> {
  const SYNTHESIS_PROMPT = `You are a Geopolitical Intelligence Synthesizer. 
Using the GOOGLE SEARCH tool, find 4 ACTUAL, REAL-WORLD news articles/events that occurred between February 2026 and April 2026.

GEOPOLITICAL CONTEXT:
${context}

STRICT FILTERING & PRIORITIZATION:
1. ONLY return events from February 2026 to April 2026.
2. At least 2 articles MUST be from February 2026.
3. Categories: Geopolitics, Maritime Trade, Energy Security, Political Policy.
4. Output MUST be in JSON format matching the schema.`;

  const SYNTHESIS_SCHEMA = {
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
  };

  const response = await fetch('/api/ai/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: SYNTHESIS_PROMPT,
      responseSchema: SYNTHESIS_SCHEMA
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Synthesis Failed");
  }
  
  return response.json();
}

export async function generalQuantChat(message: string): Promise<string> {
  const CHAT_INSTRUCTION = `You are 'QUANT-01', a high-frequency trading analyst for a geopolitical hedge fund. 
Your tone is cold, precise, and technical. 
Focus on arbitrage, risk vectors, and supply chain disruptions. 
Keep responses concise (max 3 sentences). 
Refer to market data in terms of 'volatility indices' and 'structural friction'.`;

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      systemInstruction: CHAT_INSTRUCTION
    })
  });
  
  if (!response.ok) {
    return "CRITICAL_ERROR: Connection to HFT node terminated.";
  }
  
  const data = await response.json();
  return data.text;
}

export interface FactCheckResult {
  is_likely_fake: boolean;
  verdict_summary: string;
  reasoning: string;
  warning_signs: string[];
  sources: { title: string; url: string }[];
}

export async function verifyFact(claimOrUrl: string): Promise<FactCheckResult> {
  const VERIFICATION_PROMPT = `You are a high-fidelity Fact-Checking Intelligence Agent. 
Input: A claim or a URL.
Mission: Perform extensive web research to verify the veracity of the input.
Output: Identify if it's fake/misleading, provide a concise verdict, detailed reasoning, specific warning signs to look for in similar content, and list credible sources used for verification.

Constraints:
1. Use the googleSearch tool to find multiple credible sources.
2. If it's a URL, analyze the content and the reputation of the domain.
3. Be objective and clinical.
4. Output MUST be in JSON format matching the schema provided.`;

  const VERIFICATION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      is_likely_fake: { type: Type.BOOLEAN },
      verdict_summary: { type: Type.STRING },
      reasoning: { type: Type.STRING },
      warning_signs: { 
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      sources: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            url: { type: Type.STRING }
          },
          required: ["title", "url"]
        }
      }
    },
    required: ["is_likely_fake", "verdict_summary", "reasoning", "warning_signs", "sources"]
  };

  const response = await fetch('/api/ai/fact-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: claimOrUrl,
      systemInstruction: VERIFICATION_PROMPT,
      responseSchema: VERIFICATION_SCHEMA
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Fact Check Failed");
  }
  
  return response.json();
}

export interface FutureProjection {
  headline: string;
  probability: number;
  market_impact: string;
  geopolitical_shift: string;
  recommended_hedge: string;
  reasoning: string[]; // Step-by-step logic
  detailed_explanation: string;
}

export async function projectFutureState(context: MacroInput, horizon: number): Promise<FutureProjection> {
  const PROJECTION_PROMPT = `You are the 'PREDICTIVE_ORACLE' Node. 
Target Time Horizon: ${horizon} hours into the future.

MISSION:
Using the current macroeconomic, corporate, and geopolitical context, project the most likely "Next Move" in the global landscape. 
Analyze second-order effects (e.g., if a canal is blocked for 72h, what happens to just-in-time manufacturing in Germany?).

Output MUST be a single high-fidelity projection.`;

  const PROJECTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      headline: { type: Type.STRING },
      probability: { type: Type.NUMBER, description: "0.0 to 1.0 probability of occurrence" },
      market_impact: { type: Type.STRING },
      geopolitical_shift: { type: Type.STRING },
      recommended_hedge: { type: Type.STRING },
      reasoning: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "3-4 steps of internal simulation logic"
      },
      detailed_explanation: { type: Type.STRING }
    },
    required: ["headline", "probability", "market_impact", "geopolitical_shift", "recommended_hedge", "reasoning", "detailed_explanation"]
  };

  const response = await fetch('/api/ai/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `CONTEXT: ${JSON.stringify(context, null, 2)}\n\nTIME_HORIZON: ${horizon}h`,
      systemInstruction: PROJECTION_PROMPT,
      responseSchema: PROJECTION_SCHEMA
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Simulation Failed");
  }
  
  return response.json();
}
