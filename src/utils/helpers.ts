import { Habit } from "../types";

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatDisplayTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

export const getShortDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const getWeekDays = (): Array<{name: string, shortName: string, index: number}> => {
  return [
    { name: 'Sunday', shortName: 'Su', index: 0 },
    { name: 'Monday', shortName: 'M', index: 1 },
    { name: 'Tuesday', shortName: 'Tu', index: 2 },
    { name: 'Wednesday', shortName: 'W', index: 3 },
    { name: 'Thursday', shortName: 'Th', index: 4 },
    { name: 'Friday', shortName: 'F', index: 5 },
    { name: 'Saturday', shortName: 'Sa', index: 6 },
  ];
};

export const isToday = (dateString: string): boolean => {
  const today = new Date(getNow()).toISOString().split('T')[0];
  return dateString === today;
};

export const isYesterday = (dateString: string): boolean => {
  const yesterday = new Date(getNow() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return dateString === yesterday;
};

export const generateId = (): string => {
  return getNow().toString(36) + Math.random().toString(36).substr(2);
};

export const getRandomColor = (): string => {
  const colors = [
    '#26A69A', // Teal Blue (primary)
    '#42A5F5', // Blue Habit
    '#66BB6A', // Green Habit
    '#FFA726', // Orange Habit
    '#EF5350', // Red Habit
    '#AB47BC', // Purple Habit
    '#FFEB3B', // Yellow Habit (though not used much in dark themes)
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// HabitNow color palette
export const HABITNOW_COLORS = {
  // Primary colors
  tealBlue: '#26A69A',
  blue: '#42A5F5',
  green: '#66BB6A',
  orange: '#FFA726',
  red: '#EF5350',
  purple: '#AB47BC',
  yellow: '#FFEB3B',
  
  // UI colors
  darkBackground: '#121212',
  darkSurface: '#1E1E1E',
  lightText: '#E0E0E0',
  lightBackground: '#FAFAFA',
  darkText: '#212121',
  
  // Neutral
  gray: '#BDBDBD',
};

export const calculateCompletionPercentage = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const getStreakMessage = (streak: number): string => {
  if (streak === 0) return 'Start your streak!';
  if (streak === 1) return '1 day streak';
  if (streak < 7) return `${streak} days streak`;
  if (streak < 30) {
    const weeks = Math.floor(streak / 7);
    const days = streak % 7;
    if (days === 0) return `${weeks} week${weeks > 1 ? 's' : ''} streak`;
    return `${weeks}w ${days}d streak`;
  }
  const months = Math.floor(streak / 30);
  const remainingDays = streak % 30;
  if (remainingDays === 0) return `${months} month${months > 1 ? 's' : ''} streak`;
  return `${months}m ${remainingDays}d streak`;
};

export const shouldShowHabitToday = (habit: any): boolean => {
  const today = new Date(getNow()).getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  if (habit.frequency === 'daily') {
    return true;
  }
  
  if (habit.frequency === 'weekly' && habit.targetDays) {
    return habit.targetDays.includes(today);
  }
  
  return false;
};

export const numberToDay = (day: number): string => {
  if (day < 0 || day > 6) {
    throw new Error('Day must be between 0 (Sunday) and 6 (Saturday)');
  }
  // Convert 0-6 to 1-7 (Sunday = 1, Saturday = 7)
  if (day === 0) return "Sunday"; // Sunday should be 7
  if (day === 1) return "Monday";
  if (day === 2) return "Tuesday";
  if (day === 3) return "Wednesday";
  if (day === 4) return "Thursday";
  if (day === 5) return "Friday";
  if (day === 6) return "Saturday";
  return "";
};


export const calculateTotalTargetDays = (habit: Habit): number => {
  const createdDate = new Date(habit.createdAt);
  const todayDate = new Date(getNow());
  
  // Work in UTC to avoid timezone issues
  const createdUTC = new Date(createdDate.getTime());
  const todayUTC = new Date(todayDate.getTime());
  
  // Reset to start of day in UTC
  createdUTC.setUTCHours(0, 0, 0, 0);
  todayUTC.setUTCHours(0, 0, 0, 0);
  
  if (habit.frequency === 'daily') {
    // For daily habits, count all calendar days
    const timeDiff = todayUTC.getTime() - createdUTC.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include creation day
    return Math.max(1, daysDiff);
  }
  
  if (habit.frequency === 'weekly' && habit.targetDays && habit.targetDays.length > 0) {
    // For weekly habits, count only target days
    let totalTargetDays = 0;
    const currentUTC = new Date(createdUTC.getTime());
    
    // Iterate through each day from creation to today
    while (currentUTC <= todayUTC) {
      const dayOfWeek = currentUTC.getUTCDay(); // Use UTC day (0 = Sunday, 1 = Monday, etc.)
      
      // Check if this day is a target day
      if (habit.targetDays.includes(dayOfWeek)) {
        totalTargetDays++;
      }
      
      // Move to next day in UTC
      currentUTC.setUTCDate(currentUTC.getUTCDate() + 1);
    }
    
    return Math.max(1, totalTargetDays);
  }
  
  // Fallback to calendar days
  const timeDiff = todayUTC.getTime() - createdUTC.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
  return Math.max(1, daysDiff);
};


let mockedDate: number | null = null;

export function setMockDate(fakeTime: number | string | Date) {
  mockedDate = typeof fakeTime === 'number' ? fakeTime : new Date(fakeTime).getTime();
}

export function clearMockDate() {
  mockedDate = null;
}

export function getNow(): number {
  return mockedDate ?? Date.now();
}

export function getToday(): Date {
  return new Date(getNow());
}

export function advanceMockDateBy({ days = 0, hours = 0, minutes = 0, ms = 0 }) {
  if (mockedDate === null) {
    mockedDate = Date.now(); // fallback to current date if not set
  }

  mockedDate +=
    days * 24 * 60 * 60 * 1000 +
    hours * 60 * 60 * 1000 +
    minutes * 60 * 1000 +
    ms;
}
