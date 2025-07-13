import { Habit, HabitEntry, HabitStreak, HabitStats, DashboardData } from '../types';
import { StorageService } from './StorageService';

export class AnalyticsService {
  static async calculateHabitStats(habitId: string): Promise<HabitStats> {
    const entries = await StorageService.getHabitEntriesForHabit(habitId);
    const streak = await StorageService.getHabitStreak(habitId);
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const totalCompletions = entries.filter(e => e.completed).length;
    
    const weeklyCompletions = entries.filter(e => {
      const entryDate = new Date(e.date);
      return e.completed && entryDate >= oneWeekAgo;
    }).length;
    
    const monthlyCompletions = entries.filter(e => {
      const entryDate = new Date(e.date);
      return e.completed && entryDate >= oneMonthAgo;
    }).length;
    
    // Calculate completion rate (percentage of days with entries that were completed)
    const totalEntries = entries.length;
    const completionRate = totalEntries > 0 ? (totalCompletions / totalEntries) * 100 : 0;
    
    // Calculate average weekly completions over the past month
    const weeksInMonth = 4;
    const averageWeeklyCompletions = monthlyCompletions / weeksInMonth;
    
    const streakData: HabitStreak = streak || {
      habitId,
      currentStreak: 0,
      longestStreak: 0,
      lastUpdated: new Date().toISOString()
    };
    
    return {
      habitId,
      totalCompletions,
      weeklyCompletions,
      monthlyCompletions,
      completionRate: Math.round(completionRate * 100) / 100,
      averageWeeklyCompletions: Math.round(averageWeeklyCompletions * 100) / 100,
      streakData
    };
  }

  static async updateHabitStreak(habitId: string, completed: boolean, date: string): Promise<void> {
    let streak = await StorageService.getHabitStreak(habitId);
    
    if (!streak) {
      streak = {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
        lastUpdated: date
      };
    }
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (completed) {
      if (date === today || date === yesterday) {
        streak.currentStreak += 1;
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
        }
      }
    } else {
      // If uncompleting today's habit, decrease current streak
      if (date === today && streak.currentStreak > 0) {
        streak.currentStreak -= 1;
      }
    }
    
    streak.lastUpdated = new Date().toISOString();
    await StorageService.updateHabitStreak(streak);
  }

  static async calculateStreaks(): Promise<void> {
    const habits = await StorageService.getHabits();
    
    for (const habit of habits) {
      const entries = await StorageService.getHabitEntriesForHabit(habit.id);
      const sortedEntries = entries
        .filter(e => e.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      if (sortedEntries.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Calculate streaks
        for (let i = 0; i < sortedEntries.length; i++) {
          const currentDate = sortedEntries[i].date;
          const prevDate = i > 0 ? sortedEntries[i - 1].date : null;
          
          if (prevDate) {
            const daysDiff = Math.floor(
              (new Date(currentDate).getTime() - new Date(prevDate).getTime()) / (24 * 60 * 60 * 1000)
            );
            
            if (daysDiff === 1) {
              tempStreak += 1;
            } else {
              tempStreak = 1;
            }
          } else {
            tempStreak = 1;
          }
          
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          
          // Check if this entry contributes to current streak
          if (currentDate === today || currentDate === yesterday) {
            currentStreak = tempStreak;
          }
        }
        
        // If the latest entry is not today or yesterday, current streak is 0
        const latestEntry = sortedEntries[sortedEntries.length - 1];
        if (latestEntry.date !== today && latestEntry.date !== yesterday) {
          currentStreak = 0;
        }
      }
      
      const streak: HabitStreak = {
        habitId: habit.id,
        currentStreak,
        longestStreak,
        lastUpdated: new Date().toISOString()
      };
      
      await StorageService.updateHabitStreak(streak);
    }
  }

  static async getDashboardData(): Promise<DashboardData> {
    const habits = await StorageService.getHabits();
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = await StorageService.getHabitEntriesForDate(today);
    
    const activeHabits = habits.filter(h => h.isActive);
    const totalHabits = habits.length;
    const todayCompletions = todayEntries.filter(e => e.completed).length;
    const todayTarget = activeHabits.length;
    
    // Calculate weekly progress
    const weeklyEntries: HabitEntry[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dayEntries = await StorageService.getHabitEntriesForDate(date);
      weeklyEntries.push(...dayEntries);
    }
    
    const weeklyCompletions = weeklyEntries.filter(e => e.completed).length;
    const weeklyTarget = activeHabits.length * 7;
    const weeklyProgress = weeklyTarget > 0 ? (weeklyCompletions / weeklyTarget) * 100 : 0;
    
    // Calculate monthly progress
    const monthlyEntries: HabitEntry[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dayEntries = await StorageService.getHabitEntriesForDate(date);
      monthlyEntries.push(...dayEntries);
    }
    
    const monthlyCompletions = monthlyEntries.filter(e => e.completed).length;
    const monthlyTarget = activeHabits.length * 30;
    const monthlyProgress = monthlyTarget > 0 ? (monthlyCompletions / monthlyTarget) * 100 : 0;
    
    // Get top streaks
    const streaks = await StorageService.getHabitStreaks();
    const topStreaks = streaks
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 5)
      .map(streak => {
        const habit = habits.find(h => h.id === streak.habitId);
        return {
          habitName: habit?.name || 'Unknown',
          streak: streak.currentStreak,
          color: habit?.color || '#6366f1'
        };
      });
    
    return {
      totalHabits,
      activeHabits: activeHabits.length,
      todayCompletions,
      todayTarget,
      weeklyProgress: Math.round(weeklyProgress * 100) / 100,
      monthlyProgress: Math.round(monthlyProgress * 100) / 100,
      topStreaks
    };
  }

  static async getHabitStreak(habitId: string): Promise<HabitStreak | null> {
    return await StorageService.getHabitStreak(habitId);
  }

  static getDateRange(days: number): string[] {
    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  static async getHabitCompletionData(habitId: string, days: number = 30): Promise<Array<{date: string, completed: boolean}>> {
    const entries = await StorageService.getHabitEntriesForHabit(habitId);
    const dateRange = this.getDateRange(days);
    
    return dateRange.map(date => {
      const entry = entries.find(e => e.date === date);
      return {
        date,
        completed: entry ? entry.completed : false
      };
    });
  }
}
