import { Habit, HabitEntry, HabitStreak, HabitStats, DashboardData } from '../types';
import { getNow, shouldShowHabitToday } from '../utils/helpers';
import { StorageService } from './StorageService';

export class AnalyticsService {
  static async calculateHabitStats(habitId: string): Promise<HabitStats> {
    const entries = await StorageService.getHabitEntriesForHabit(habitId);
    const streak = await StorageService.getHabitStreak(habitId);
    
    const now = new Date(getNow());
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
      lastUpdated: new Date(getNow()).toISOString()
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

  static async updateHabitStreak(habitId: string): Promise<void> {
     const habit = await StorageService.getHabits().then(habits => habits.find(h => h.id === habitId));
      if (!habit) return;

    if(habit.frequency === 'daily'){
      await this.calculateDailyStreak(habit);

    } else if (habit.frequency === 'weekly') {
      // For weekly habits, recalculate streaks based on weekly completion
      await this.calculateWeeklyStreak(habit);
      
    }
    
   
  }

  static async calculateStreaks(): Promise<void> {
    const habits = await StorageService.getHabits();
    
    for (const habit of habits) {
      if (habit.frequency === 'daily') {
        await this.calculateDailyStreak(habit);
      } else if (habit.frequency === 'weekly') {
        await this.calculateWeeklyStreak(habit);
      }
    }
  }


  static async calculateDailyStreak(habit: Habit): Promise<void> {
    const entries = await StorageService.getHabitEntriesForHabit(habit.id);
    const sortedEntries = entries
      .filter(e => e.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (sortedEntries.length > 0) {
      const today = new Date(getNow()).toISOString().split('T')[0];
      const yesterday = new Date(getNow() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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
      lastUpdated: new Date(getNow()).toISOString()
    };

    await StorageService.updateHabitStreak(streak);
  }

  static async calculateWeeklyStreak(habit: Habit): Promise<void> {
    const entries = await StorageService.getHabitEntriesForHabit(habit.id);
    const targetDays = habit.targetDays || []; // Days of week this habit should be done (0=Sunday, 1=Monday, etc.)
    
    if (targetDays.length === 0) {
      const streak: HabitStreak = {
        habitId: habit.id,
        currentStreak: 0,
        longestStreak: 0,
        lastUpdated: new Date(getNow()).toISOString()
      };
      await StorageService.updateHabitStreak(streak);
      return;
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Generate all expected target dates from habit creation to today
    const habitCreated = new Date(habit.createdAt);
    const today = new Date(getNow());
    const expectedDates = await this.generateExpectedTargetDates(habitCreated, today, targetDays);

    // Sort expected dates chronologically
    expectedDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    // Process each expected date
    for (let i = 0; i < expectedDates.length; i++) {
      const expectedDate = expectedDates[i];
      const todayDateStr = today.toISOString().split('T')[0];
      
      // Skip future dates
      if (expectedDate > todayDateStr) {
        break;
      }


      // Check if this date was completed
      const entry = entries.find(e => e.date === expectedDate);
      const isCompleted = entry && entry.completed;
      console.log(`Processing date: ${expectedDate}, Completed: ${isCompleted}`);

      if (isCompleted) {
        // Completed - increment streak
        tempStreak++;
        
        // Update longest streak if needed
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        
        // This becomes current streak since it's the most recent
        currentStreak = tempStreak;
      } else {
        // Missed or not completed - reset streak
        tempStreak = 0;
        currentStreak = 0; // Current streak is broken
      }
    }

    // Handle edge case: if today is a target day and not completed yet
    const todayDayOfWeek = today.getDay();
    const todayDateStr = today.toISOString().split('T')[0];
    
    if (targetDays.includes(todayDayOfWeek)) {
      const todayEntry = entries.find(e => e.date === todayDateStr);
      
      // If today is a target day and it's not completed, the streak should be 0
      // (unless we want to give them until end of day)
      if (!todayEntry || !todayEntry.completed) {
        // You can choose to reset immediately or wait until day ends
        // For immediate feedback, uncomment the next line:
        // currentStreak = 0;
      }
    }

    const streak: HabitStreak = {
      habitId: habit.id,
      currentStreak,
      longestStreak,
      lastUpdated: new Date(getNow()).toISOString()
    };

    console.log(`Updated streak for habit ${habit.name}:`, streak);

    await StorageService.updateHabitStreak(streak);
  }

  // Generate all expected target dates from start to end
  static async generateExpectedTargetDates(
    startDate: Date, 
    endDate: Date, 
    targetDays: number[]
  ): Promise<string[]> {
    const expectedDates: string[] = [];
    
    // Work in UTC to avoid timezone issues
    const current = new Date(startDate.getTime());
    const end = new Date(endDate.getTime());
    
    // Reset to start of day in UTC
    current.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    while (current <= end) {
      const dayOfWeek = current.getUTCDay(); // Use UTC day
      
      // If current day is a target day, add it to expected dates
      if (targetDays.includes(dayOfWeek)) {
        expectedDates.push(current.toISOString().split('T')[0]);
      }
      
      // Move to next day in UTC
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return expectedDates;
  }

  static async getDashboardData(): Promise<DashboardData> {
    const habits = await StorageService.getHabits();
    const today = new Date(getNow()).toISOString().split('T')[0];
    const todayEntries = await StorageService.getHabitEntriesForDate(today);
    
    const activeHabits = habits.filter(h => h.isActive && shouldShowHabitToday(h));
    const totalHabits = habits.length;
    const todayCompletions = todayEntries.filter(e => e.completed).length;
    const todayTarget = activeHabits.length;
    
    // Calculate weekly progress
    const weeklyEntries: HabitEntry[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(getNow() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dayEntries = await StorageService.getHabitEntriesForDate(date);
      weeklyEntries.push(...dayEntries);
    }
    
    const weeklyCompletions = weeklyEntries.filter(e => e.completed).length;
    const weeklyTarget = activeHabits.length * 7;
    const weeklyProgress = weeklyTarget > 0 ? (weeklyCompletions / weeklyTarget) * 100 : 0;
    
    // Calculate monthly progress
    const monthlyEntries: HabitEntry[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(getNow() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
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
      const date = new Date(getNow() - i * 24 * 60 * 60 * 1000);
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
