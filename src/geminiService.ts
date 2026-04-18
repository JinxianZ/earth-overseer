import { GoogleGenAI, Type } from "@google/genai";
import { MacroInput, MacroOutput } from "./types";

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

// Safety settings to allow discussion of conflict/scandal as requested
const SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_NONE" }
];

let aiClient: GoogleGenAI | null = null;

function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function analyzeMacroRisk(input: MacroInput): Promise<MacroOutput> {
  const ai = getAI();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        { role: 'user', parts: [{ text: JSON.stringify(input, null, 2) }] }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        safetySettings: SAFETY_SETTINGS as any,
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text) as MacroOutput;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}
