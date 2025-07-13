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
    { name: 'Sunday', shortName: 'Sun', index: 0 },
    { name: 'Monday', shortName: 'Mon', index: 1 },
    { name: 'Tuesday', shortName: 'Tue', index: 2 },
    { name: 'Wednesday', shortName: 'Wed', index: 3 },
    { name: 'Thursday', shortName: 'Thu', index: 4 },
    { name: 'Friday', shortName: 'Fri', index: 5 },
    { name: 'Saturday', shortName: 'Sat', index: 6 },
  ];
};

export const isToday = (dateString: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
};

export const isYesterday = (dateString: string): boolean => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return dateString === yesterday;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  if (habit.frequency === 'daily') {
    return true;
  }
  
  if (habit.frequency === 'weekly' && habit.targetDays) {
    return habit.targetDays.includes(today);
  }
  
  return false;
};
