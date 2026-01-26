
export enum DayOfWeek {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday'
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  countryCode: string;
  password?: string;
}

export interface DayConstraint {
  maxHour?: number;
  maxTotalHours?: number;
}

export interface Worker {
  id: string;
  name: string;
  color: string; // Automatic unique color
  priority: number; // Rank for desired hours (lower number = higher priority for hours)
  possibleStart: number;
  possibleEnd: number;
  preferredStart: number;
  preferredEnd: number;
  preferredDaysCount: number;
  preferredDays: DayOfWeek[];
  unavailableDays: DayOfWeek[];
  isFlexible: boolean;
  constraints: Partial<Record<DayOfWeek, DayConstraint>>;
}

export interface StaffingRequirement {
  day: DayOfWeek;
  hour: number;
  neededCount: number;
  mandatoryWorkerIds?: string[]; // Specifically requested workers for this slot
}

export interface ScheduleEntry {
  workerId: string;
  day: DayOfWeek;
  hour: number;
}

export interface OperatingHours {
  open: number;
  close: number;
}

export interface Bar {
  id: string;
  name: string;
  address: string;
  city: string;
  photoUrl: string;
  operatingHours: Record<DayOfWeek, OperatingHours>;
  workers: Worker[];
  requirements: StaffingRequirement[];
  schedule: ScheduleEntry[];
}
