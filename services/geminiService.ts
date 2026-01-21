
import { GoogleGenAI, Type } from "@google/genai";
import { Worker, StaffingRequirement, ScheduleEntry } from "../types";

export class GeminiScheduler {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateSchedule(workers: Worker[], requirements: StaffingRequirement[]): Promise<ScheduleEntry[]> {
    const prompt = `
      You are an expert workforce scheduler. Create an hourly staff schedule for a bar.
      
      BAR HOURS: 4 AM (4) to 8 PM (20).
      
      WORKERS:
      ${JSON.stringify(workers, null, 2)}
      
      STAFFING REQUIREMENTS (How many people needed per hour per day):
      ${JSON.stringify(requirements, null, 2)}
      
      SCHEDULING RULES (PRIORITY ORDER):
      1. HARD CONSTRAINT: Workers MUST NOT work outside their "possibleStart" to "possibleEnd" range.
      2. HARD CONSTRAINT: Staffing requirements MUST be met exactly if possible.
      3. PREFERENCE: Try to assign workers to work their "preferredDaysCount" total days per week.
      4. PREFERENCE: Try to keep shifts within "preferredStart" and "preferredEnd".
      5. EFFICIENCY: Shifts should be contiguous (no split shifts).
      6. BALANCE: Distribute evening/early shifts fairly.
      
      Output a valid JSON array of ScheduleEntry objects.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                workerId: { type: Type.STRING },
                day: { type: Type.STRING },
                hour: { type: Type.NUMBER }
              },
              required: ["workerId", "day", "hour"]
            }
          },
          thinkingConfig: { thinkingBudget: 24000 }
        }
      });

      const text = response.text;
      const result = JSON.parse(text || '[]');
      return result;
    } catch (error) {
      console.error("Error generating schedule:", error);
      throw error;
    }
  }
}
