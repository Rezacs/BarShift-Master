
import { DayOfWeek, OperatingHours } from './types';

export const DAYS: DayOfWeek[] = [
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
  DayOfWeek.Saturday,
  DayOfWeek.Sunday,
];

// Added missing HOURS constant to resolve import errors across the application
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const formatHour = (hour: number) => {
  const h = hour % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12} ${ampm}`;
};

export const getHoursForDay = (config: OperatingHours) => {
  const hours: number[] = [];
  for (let i = config.open; i <= config.close; i++) {
    hours.push(i);
  }
  return hours;
};

// Default hours for new bars
export const DEFAULT_OPERATING_HOURS: OperatingHours = { open: 4, close: 20 };
