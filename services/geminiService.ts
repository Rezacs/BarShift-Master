
import { GoogleGenAI, Type } from "@google/genai";
import { Worker, StaffingRequirement, ScheduleEntry, OperatingHours, DayOfWeek } from "../types";

export class GeminiScheduler {
  async generateSchedule(
    workers: Worker[], 
    requirements: StaffingRequirement[], 
    operatingHours: Record<DayOfWeek, OperatingHours>
  ): Promise<ScheduleEntry[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Sort workers by priority for the prompt context
    const sortedWorkers = [...workers].sort((a, b) => (a.priority || 0) - (b.priority || 0));

    const prompt = `
      You are a workforce scheduling algorithm for a bar.
      
      OPERATING HOURS:
      ${JSON.stringify(operatingHours, null, 2)}
      
      WORKERS (Ordered by Preference Rank - Top workers have first pick of shifts, but weekly hours must remain balanced):
      ${JSON.stringify(sortedWorkers, null, 2)}
      
      STAFFING REQUIREMENTS (Check for 'mandatoryWorkerIds' - these people MUST work these specific hours):
      ${JSON.stringify(requirements, null, 2)}
      
      SCHEDULING RULES (STRICT):
      1. MANDATORY ASSIGNMENTS: If a requirement has 'mandatoryWorkerIds', those specific workers MUST be in the final schedule for that day and hour.
      2. ABSOLUTE MAX 8 HOURS: Under no circumstances can a worker exceed 8 total hours in a single calendar day.
      3. WORKLOAD EQUALITY: Aim for a "quasi-equal" distribution of total weekly hours. If 100 total hours are needed and there are 5 staff, aim for ~20 hours each.
      4. PRIORITY BREAKING: Use the worker list order to decide who gets preferred shifts, but do not override equality.
      5. HARD CONSTRAINT: NEVER schedule a worker when the venue is closed.
      6. HARD CONSTRAINT: Never schedule a worker on their "unavailableDays".
      7. HARD CONSTRAINT: Never assign a worker outside their global possibleStart/possibleEnd window.
      8. MATCH DEMAND: Match the neededCount for each hour. Mandatory workers count towards this neededCount.
      9. CONTINUITY: Prefer continuous blocks of time.
      
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
