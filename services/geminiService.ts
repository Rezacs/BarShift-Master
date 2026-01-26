
import { GoogleGenAI, Type } from "@google/genai";
import { Worker, StaffingRequirement, ScheduleEntry, OperatingHours, DayOfWeek } from "../types";

export class GeminiScheduler {
  async generateSchedule(
    workers: Worker[], 
    requirements: StaffingRequirement[], 
    operatingHours: Record<DayOfWeek, OperatingHours>
  ): Promise<ScheduleEntry[]> {
    // Create fresh instance right before call to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Sort workers by priority (lower number = higher priority)
    const sortedWorkers = [...workers].sort((a, b) => (a.priority || 0) - (b.priority || 0));

    const prompt = `
      You are an expert workforce scheduling algorithm. Create a weekly roster for a bar.
      
      CONTEXT:
      - Operating Hours: ${JSON.stringify(operatingHours)}
      - Staff Profiles: ${JSON.stringify(sortedWorkers.map(w => ({ 
          id: w.id, 
          name: w.name, 
          unavailable: w.unavailableDays, 
          possible: [w.possibleStart, w.possibleEnd],
          priority: w.priority
        })))}
      - Staffing Demands (neededCount): ${JSON.stringify(requirements)}
      
      SCHEDULING CONSTRAINTS (STRICT):
      1. MANDATORY STAFF: If 'mandatoryWorkerIds' exists for a specific hour, those specific workers MUST be scheduled.
      2. 8-HOUR DAILY CAP: No staff member can work more than 8 total hours in one calendar day.
      3. AVAILABILITY: Respect 'unavailableDays' and 'possibleStart/End' windows for every worker.
      4. WORKLOAD FAIRNESS: Distribute total weekly hours as evenly as possible among all available staff.
      5. CONTINUITY: Prefer assigning shifts in solid contiguous blocks (e.g., 4-8 hours) rather than fragmented single hours.
      6. CLOSED HOURS: Never schedule any staff member when the bar is closed for that day.
      7. DEMAND MATCHING: Match the 'neededCount' exactly. Mandatory workers count toward this total.

      Output a JSON array of objects: [{"workerId": "...", "day": "...", "hour": 0}, ...]
    `;

    try {
      const response = await ai.models.generateContent({
        // Gemini 3 Flash is faster and has much higher free tier limits
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 8000 },
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
      if (!text) throw new Error("AI returned an empty response.");
      
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("AI response was not a valid schedule array.");
      
      return parsed;
    } catch (error: any) {
      console.error("Gemini Scheduling API Error:", error);
      throw error;
    }
  }
}
