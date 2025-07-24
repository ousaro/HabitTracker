import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Habit, HabitEntry, DashboardData } from '../types';
import { StorageService } from '../services/StorageService';
import { AnalyticsService } from '../services/AnalyticsService';
import { HabitStatsService } from '../services/HabitStatsService';
import { HabitCard } from '../components/HabitCard';
import { StatsCard } from '../components/StatsCard';
import { formatDate, shouldShowHabitToday, generateId, getNow } from '../utils/helpers';
import { useTheme } from '../theme/ThemeProvider';

export const HomeScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayEntries, setTodayEntries] = useState<HabitEntry[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = formatDate(new Date(getNow()));

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load habits and today's entries
      const [allHabits, entries, dashboard] = await Promise.all([
        StorageService.getHabits(),
        StorageService.getHabitEntriesForDate(today),
        AnalyticsService.getDashboardData(),
      ]);
      
      // Update completion percentages in background
      HabitStatsService.updateAllCompletionPercentages();
      
      // Filter active habits that should show today
      const activeHabits = allHabits.filter(h => h.isActive && shouldShowHabitToday(h));
      
      // Load streaks for active habits
      const streakPromises = activeHabits.map(habit => 
        StorageService.getHabitStreak(habit.id)
      );
      const streakResults = await Promise.all(streakPromises);
      
      const streakMap: Record<string, number> = {};
      activeHabits.forEach((habit, index) => {
        streakMap[habit.id] = streakResults[index]?.currentStreak || 0;
      });

      setHabits(activeHabits);
      setTodayEntries(entries);
      setDashboardData(dashboard);
      setStreaks(streakMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const toggleHabit = async (habit: Habit) => {
    try {
      const existingEntry = todayEntries.find(e => e.habitId === habit.id);
      const isCompleted = !existingEntry?.completed;
      
      const entry: HabitEntry = {
        id: existingEntry?.id || generateId(),
        habitId: habit.id,
        date: today,
        completed: isCompleted,
        completedAt: isCompleted ? new Date(getNow()).toISOString() : undefined,
      };

      await StorageService.addHabitEntry(entry);
      await AnalyticsService.updateHabitStreak(habit.id);
      
      // Update local state
      const updatedEntries = existingEntry
        ? todayEntries.map(e => e.id === entry.id ? entry : e)
        : [...todayEntries, entry];
      
      setTodayEntries(updatedEntries);
      
      // Update streak
      const updatedStreak = await StorageService.getHabitStreak(habit.id);
      setStreaks(prev => ({
        ...prev,
        [habit.id]: updatedStreak?.currentStreak || 0,
      }));
      
      // Refresh dashboard data
      const newDashboard = await AnalyticsService.getDashboardData();
      setDashboardData(newDashboard);
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const renderHabitCard = ({ item, index }: { item: Habit; index: number }) => {
    const entry = todayEntries.find(e => e.habitId === item.id);
    const streak = streaks[item.id] || 0;
    
    return (
      <View style={[styles.habitCardContainer, { marginHorizontal: theme.spacing.sm }]}>
        <HabitCard
          habit={item}
          entry={entry}
          streak={streak}
          onToggle={toggleHabit}
          onPress={() => {}}
          animationDelay={index * 100}
        />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Good morning!</Text>
            <Text style={styles.dateText}>
              {new Date(getNow()).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
            <MaterialIcons 
              name={theme.colors.background === '#121212' ? "light-mode" : "dark-mode"} 
              size={24} 
              color="#ffffff" 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderStats = () => {
    if (!dashboardData) return null;

    return (
      <View style={[styles.statsContainer, { paddingHorizontal: theme.spacing.lg }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Progress</Text>
        <View style={styles.statsRow}>
          <StatsCard
            title="Completed"
            value={`${dashboardData.todayCompletions}/${dashboardData.todayTarget}`}
            icon="check-circle"
            color={theme.colors.success}
            subtitle="habits today"
            animationDelay={0}
          />
          <StatsCard
            title="Weekly"
            value={`${Math.round(dashboardData.weeklyProgress)}%`}
            icon="trending-up"
            color={theme.colors.primary}
            subtitle="completion rate"
            animationDelay={100}
          />
          <StatsCard
            title="Streak"
            value={dashboardData.topStreaks[0]?.streak || 0}
            icon="local-fire-department"
            color={theme.colors.warning}
            subtitle="best streak"
            animationDelay={200}
          />
        </View>
      </View>
    );
  };

  const renderHabits = () => (
    <View style={[styles.habitsContainer, { paddingHorizontal: theme.spacing.md }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Habits</Text>
        <Text style={[styles.habitCount, { color: theme.colors.textSecondary }]}>
          {habits.length} habit{habits.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="spa" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyStateTitle, { color: theme.colors.textSecondary }]}>No habits for today</Text>
          <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
            Start building great habits by adding your first one!
          </Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          renderItem={renderHabitCard}
          keyExtractor={(item: Habit) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        />
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialIcons name="hourglass-empty" size={48} color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading your habits...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}
        {renderStats()}
        {renderHabits()}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerGradient: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  habitsContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitCount: {
    fontSize: 14,
  },
  habitCardContainer: {
    marginVertical: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 32,
  },
});
