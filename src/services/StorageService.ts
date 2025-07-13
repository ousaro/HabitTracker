import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitEntry, HabitStreak } from '../types';

const HABITS_KEY = '@habits';
const HABIT_ENTRIES_KEY = '@habit_entries';
const HABIT_STREAKS_KEY = '@habit_streaks';

// StorageService class to handle all storage operations related to habits, entries, and streaks
// This storage is an in-memory storage using AsyncStorage for offline persistence

export class StorageService {
  // Habits
  static async getHabits(): Promise<Habit[]> {
    try {
      const habits = await AsyncStorage.getItem(HABITS_KEY);
      return habits ? JSON.parse(habits) : [];
    } catch (error) {
      console.error('Error getting habits:', error);
      return [];
    }
  }

  static async saveHabits(habits: Habit[]): Promise<void> {
    try {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  }

  static async addHabit(habit: Habit): Promise<void> {
    try {
      const habits = await this.getHabits();
      // Set order to be at the end of current habits
      const maxOrder = habits.reduce((max, h) => {
        return h.order !== undefined ? Math.max(max, h.order) : max;
      }, -1);
      const habitWithOrder = { ...habit, order: maxOrder + 1 };
      habits.push(habitWithOrder);
      await this.saveHabits(habits);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  }

  static async updateHabit(updatedHabit: Habit): Promise<void> {
    try {
      const habits = await this.getHabits();
      const index = habits.findIndex(h => h.id === updatedHabit.id);
      if (index !== -1) {
        habits[index] = updatedHabit;
        await this.saveHabits(habits);
      }
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  }

  static async deleteHabit(habitId: string): Promise<void> {
    try {
      const habits = await this.getHabits();
      const filteredHabits = habits.filter(h => h.id !== habitId);
      await this.saveHabits(filteredHabits);
      
      // Also delete related entries and streaks
      await this.deleteHabitEntries(habitId);
      await this.deleteHabitStreak(habitId);
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  }

  static async updateHabitsOrder(habits: Habit[]): Promise<void> {
    try {
      // Update the order property for each habit
      const updatedHabits = habits.map((habit, index) => ({
        ...habit,
        order: index
      }));
      await this.saveHabits(updatedHabits);
    } catch (error) {
      console.error('Error updating habits order:', error);
    }
  }

  // Habit Entries
  static async getHabitEntries(): Promise<HabitEntry[]> {
    try {
      const entries = await AsyncStorage.getItem(HABIT_ENTRIES_KEY);
      return entries ? JSON.parse(entries) : [];
    } catch (error) {
      console.error('Error getting habit entries:', error);
      return [];
    }
  }

  static async getAllHabitEntries(): Promise<HabitEntry[]> {
    return this.getHabitEntries();
  }

  static async saveHabitEntries(entries: HabitEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(HABIT_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving habit entries:', error);
    }
  }

  static async addHabitEntry(entry: HabitEntry): Promise<void> {
    try {
      const entries = await this.getHabitEntries();
      // Remove existing entry for the same habit and date if it exists
      const filteredEntries = entries.filter(
        e => !(e.habitId === entry.habitId && e.date === entry.date)
      );
      filteredEntries.push(entry);
      await this.saveHabitEntries(filteredEntries);
    } catch (error) {
      console.error('Error adding habit entry:', error);
    }
  }

  static async getHabitEntriesForDate(date: string): Promise<HabitEntry[]> {
    try {
      const entries = await this.getHabitEntries();
      return entries.filter(e => e.date === date);
    } catch (error) {
      console.error('Error getting habit entries for date:', error);
      return [];
    }
  }

  static async getHabitEntriesForHabit(habitId: string): Promise<HabitEntry[]> {
    try {
      const entries = await this.getHabitEntries();
      return entries.filter(e => e.habitId === habitId);
    } catch (error) {
      console.error('Error getting habit entries for habit:', error);
      return [];
    }
  }

  static async deleteHabitEntries(habitId: string): Promise<void> {
    try {
      const entries = await this.getHabitEntries();
      const filteredEntries = entries.filter(e => e.habitId !== habitId);
      await this.saveHabitEntries(filteredEntries);
    } catch (error) {
      console.error('Error deleting habit entries:', error);
    }
  }

  // Habit Streaks
  static async getHabitStreaks(): Promise<HabitStreak[]> {
    try {
      const streaks = await AsyncStorage.getItem(HABIT_STREAKS_KEY);
      return streaks ? JSON.parse(streaks) : [];
    } catch (error) {
      console.error('Error getting habit streaks:', error);
      return [];
    }
  }

  static async saveHabitStreaks(streaks: HabitStreak[]): Promise<void> {
    try {
      await AsyncStorage.setItem(HABIT_STREAKS_KEY, JSON.stringify(streaks));
    } catch (error) {
      console.error('Error saving habit streaks:', error);
    }
  }

  static async updateHabitStreak(streak: HabitStreak): Promise<void> {
    try {
      const streaks = await this.getHabitStreaks();
      const index = streaks.findIndex(s => s.habitId === streak.habitId);
      if (index !== -1) {
        streaks[index] = streak;
      } else {
        streaks.push(streak);
      }
      await this.saveHabitStreaks(streaks);
    } catch (error) {
      console.error('Error updating habit streak:', error);
    }
  }

  static async getHabitStreak(habitId: string): Promise<HabitStreak | null> {
    try {
      const streaks = await this.getHabitStreaks();
      return streaks.find(s => s.habitId === habitId) || null;
    } catch (error) {
      console.error('Error getting habit streak:', error);
      return null;
    }
  }

  static async deleteHabitStreak(habitId: string): Promise<void> {
    try {
      const streaks = await this.getHabitStreaks();
      const filteredStreaks = streaks.filter(s => s.habitId !== habitId);
      await this.saveHabitStreaks(filteredStreaks);
    } catch (error) {
      console.error('Error deleting habit streak:', error);
    }
  }

  // Clear all data (for testing or reset)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([HABITS_KEY, HABIT_ENTRIES_KEY, HABIT_STREAKS_KEY]);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}
