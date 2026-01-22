
import { GoogleGenAI, Type } from "@google/genai";
import { Worker, StaffingRequirement, ScheduleEntry, OperatingHours, DayOfWeek } from "../types";

export class GeminiScheduler {
  // Removed static ai instance to ensure fresh initialization with correct API key, adhering to SDK rules

  async generateSchedule(
    workers: Worker[], 
    requirements: StaffingRequirement[], 
    operatingHours: Record<DayOfWeek, OperatingHours>
  ): Promise<ScheduleEntry[]> {
    // Initializing GoogleGenAI inside the method to ensure it uses the most current API key environment variable
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      You are a workforce scheduling algorithm. Create a staff schedule for a hospitality venue.
      
      OPERATING HOURS:
      ${JSON.stringify(operatingHours, null, 2)}
      
      WORKERS:
      ${JSON.stringify(workers, null, 2)}
      
      STAFFING REQUIREMENTS:
      ${JSON.stringify(requirements, null, 2)}
      
      SCHEDULING LOGIC:
      1. HARD CONSTRAINT: NEVER schedule a worker when the venue is closed (see OPERATING HOURS).
      2. HARD CONSTRAINT: Never schedule a worker on their "unavailableDays".
      3. HARD CONSTRAINT: Never assign a worker outside their possibleStart/possibleEnd.
      4. STAFFING: Match the neededCount for each hour exactly.
      5. BACKUP: Workers with "isFlexible: true" should be assigned last.
      6. CONTINUITY: Shifts should be continuous (one block per day).
      
      OUTPUT: JSON array of ScheduleEntry objects: [{workerId: string, day: string, hour: number}, ...].
    `;

    try {
      const response = await ai.models.generateContent({
        // Upgraded to gemini-3-pro-preview for handling the complex reasoning required for scheduling
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
          // Removed thinkingBudget constraint to allow the model to use its full reasoning potential for the task
        }
      });

      // Directly accessing .text property as per extracting output guidelines
      const text = response.text;
      return JSON.parse(text || '[]');
    } catch (error) {
      console.error("Error generating schedule:", error);
      throw error;
    }
  }
}
