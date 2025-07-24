import { StorageService } from './StorageService';
import { Habit, HabitEntry } from '../types';
import { formatDate, getNow } from '../utils/helpers';

export class HabitStatsService {
  /**
   * Calculate completion percentage for a habit over the last 30 days
   */
  static async calculateCompletionPercentage(habitId: string): Promise<number> {
    try {
      const today = new Date(getNow());
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      let totalExpectedDays = 0;
      let completedDays = 0;
      
      // Get habit to check frequency
      const habits = await StorageService.getHabits();
      const habit = habits.find(h => h.id === habitId);
      
      if (!habit) return 0;
      
      // Count expected and completed days over the last 30 days
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
        const dateString = formatDate(checkDate);
        
        // Check if habit should be done on this day
        let shouldBeDone = false;
        
        if (habit.frequency === 'daily') {
          shouldBeDone = true;
        } else if (habit.frequency === 'weekly' && habit.targetDays) {
          const dayOfWeek = checkDate.getDay();
          shouldBeDone = habit.targetDays.includes(dayOfWeek);
        }
        
        if (shouldBeDone) {
          totalExpectedDays++;
          
          // Check if it was completed
          const entries = await StorageService.getHabitEntriesForDate(dateString);
          const entry = entries.find(e => e.habitId === habitId && e.completed);
          
          if (entry) {
            completedDays++;
          }
        }
      }
      
      if (totalExpectedDays === 0) return 0;
      return Math.round((completedDays / totalExpectedDays) * 100);
    } catch (error) {
      console.error('Error calculating completion percentage:', error);
      return 0;
    }
  }
  
  /**
   * Update completion percentages for all habits
   */
  static async updateAllCompletionPercentages(): Promise<void> {
    try {
      const habits = await StorageService.getHabits();
      const updatedHabits: Habit[] = [];
      
      for (const habit of habits) {
        const percentage = await this.calculateCompletionPercentage(habit.id);
        updatedHabits.push({
          ...habit,
          completionPercentage: percentage,
        });
      }
      
      await StorageService.saveHabits(updatedHabits);
    } catch (error) {
      console.error('Error updating completion percentages:', error);
    }
  }
  
  /**
   * Get weekly completion data for analytics
   */
  static async getWeeklyCompletionData(habitId: string): Promise<number[]> {
    try {
      const today = new Date(getNow());
      const weekData: number[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
        const dateString = formatDate(checkDate);
        
        const entries = await StorageService.getHabitEntriesForDate(dateString);
        const entry = entries.find(e => e.habitId === habitId && e.completed);
        
        weekData.push(entry ? 1 : 0);
      }
      
      return weekData;
    } catch (error) {
      console.error('Error getting weekly completion data:', error);
      return Array(7).fill(0);
    }
  }
}
