
export enum DayOfWeek {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday'
}

export interface DayConstraint {
  maxHour?: number; // e.g., 17 (5 PM)
  maxTotalHours?: number; // e.g., 8 hours total
}

export interface Worker {
  id: string;
  name: string;
  possibleStart: number;
  possibleEnd: number;
  preferredStart: number;
  preferredEnd: number;
  preferredDaysCount: number;
  constraints: Partial<Record<DayOfWeek, DayConstraint>>;
}

export interface StaffingRequirement {
  day: DayOfWeek;
  hour: number; // 4-20
  neededCount: number;
}

export interface ScheduleEntry {
  workerId: string;
  day: DayOfWeek;
  hour: number;
}

export interface ScheduleData {
  workers: Worker[];
  requirements: StaffingRequirement[];
  schedule: ScheduleEntry[];
}
