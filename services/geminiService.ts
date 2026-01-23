
import { GoogleGenAI, Type } from "@google/genai";
import { Worker, StaffingRequirement, ScheduleEntry, OperatingHours, DayOfWeek } from "../types";

export class GeminiScheduler {
  async generateSchedule(
    workers: Worker[], 
    requirements: StaffingRequirement[], 
    operatingHours: Record<DayOfWeek, OperatingHours>
  ): Promise<ScheduleEntry[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      You are a workforce scheduling algorithm for a bar.
      
      OPERATING HOURS:
      ${JSON.stringify(operatingHours, null, 2)}
      
      WORKERS:
      ${JSON.stringify(workers, null, 2)}
      
      STAFFING REQUIREMENTS:
      ${JSON.stringify(requirements, null, 2)}
      
      SCHEDULING RULES (STRICT):
      1. MAX 8 HOURS: No worker can work more than 8 hours total in a single day.
      2. FAIRNESS: Distribute total weekly hours as evenly as possible among all available workers. Avoid scheduling one person 40 hours and another 10 if both are available.
      3. HARD CONSTRAINT: NEVER schedule a worker when the venue is closed (see OPERATING HOURS).
      4. HARD CONSTRAINT: Never schedule a worker on their "unavailableDays".
      5. HARD CONSTRAINT: Never assign a worker outside their global possibleStart/possibleEnd window.
      6. MATCH DEMAND: Exactly match the neededCount for each hour as defined in STAFFING REQUIREMENTS.
      7. FLEXIBILITY: Workers with "isFlexible: true" are backup only; use them only after other staff are utilized fairly.
      8. CONTINUITY: Prefer continuous shifts (e.g., one block of 4-8 hours rather than split shifts).
      
      OUTPUT: JSON array of ScheduleEntry objects: [{workerId: string, day: string, hour: number}, ...].
    `;

    try {
      const response = await ai.models.generateContent({
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
          }
        }
      });

      const text = response.text;
      return JSON.parse(text || '[]');
    } catch (error) {
      console.error("Error generating schedule:", error);
      throw error;
    }
  }
}
