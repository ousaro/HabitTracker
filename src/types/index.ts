export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'custom';
  targetDays?: number[]; // For weekly: [0,1,2,3,4,5,6] where 0 = Sunday
  targetCount?: number; // For custom frequency
  reminderTime?: string; // HH:MM format
  createdAt: string;
  isActive: boolean;
  completionPercentage?: number; // Add completion percentage
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastUpdated: string;
}

export interface HabitStats {
  habitId: string;
  totalCompletions: number;
  weeklyCompletions: number;
  monthlyCompletions: number;
  completionRate: number; // percentage
  averageWeeklyCompletions: number;
  streakData: HabitStreak;
}

export interface DashboardData {
  totalHabits: number;
  activeHabits: number;
  todayCompletions: number;
  todayTarget: number;
  weeklyProgress: number;
  monthlyProgress: number;
  topStreaks: Array<{
    habitName: string;
    streak: number;
    color: string;
  }>;
}

export type RootStackParamList = {
  Main: undefined;
  AddHabit: undefined;
  EditHabit: { habitId: string };
  HabitDetail: { habitId: string };
  Analytics: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Habits: undefined;
  Analytics: undefined;
  Settings: undefined;
};
