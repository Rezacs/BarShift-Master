
import { DayOfWeek } from './types';

export const BAR_OPEN_HOUR = 4;
export const BAR_CLOSE_HOUR = 20; // 8 PM
export const HOURS = Array.from({ length: BAR_CLOSE_HOUR - BAR_OPEN_HOUR + 1 }, (_, i) => BAR_OPEN_HOUR + i);
export const DAYS: DayOfWeek[] = [
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
  DayOfWeek.Saturday,
  DayOfWeek.Sunday,
];

export const formatHour = (hour: number) => {
  const h = hour % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12} ${ampm}`;
};
