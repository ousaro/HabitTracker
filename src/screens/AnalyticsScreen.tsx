import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Habit, HabitEntry } from '../types';
import { StorageService } from '../services/StorageService';
import { useTheme } from '../theme/ThemeProvider';
import { getNow } from '../utils/helpers';

const { width } = Dimensions.get('window');

export const AnalyticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const allHabits = await StorageService.getHabits();
      const allEntries = await StorageService.getHabitEntries();
      setHabits(allHabits);
      setHabitEntries(allEntries);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const calculateStats = () => {
    const now = new Date(getNow());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setDate(now.getDate() - 30);

    let weeklyCompletions = 0;
    let monthlyCompletions = 0;
    let totalPossibleWeekly = 0;
    let totalPossibleMonthly = 0;

    habits.forEach(habit => {
      if (habit.isActive) {
        // Get completed entries for this habit
        const habitCompletions = habitEntries.filter(entry => 
          entry.habitId === habit.id && entry.completed
        );

        // Count weekly completions
        const weeklyCompleted = habitCompletions.filter(entry => {
          const completedDate = new Date(entry.date);
          return completedDate >= weekStart;
        }).length;
        weeklyCompletions += weeklyCompleted;
        totalPossibleWeekly += 7; // 7 days in a week

        // Count monthly completions
        const monthlyCompleted = habitCompletions.filter(entry => {
          const completedDate = new Date(entry.date);
          return completedDate >= monthStart;
        }).length;
        monthlyCompletions += monthlyCompleted;
        totalPossibleMonthly += 30; // 30 days in a month
      }
    });

    const weeklyPercentage = totalPossibleWeekly > 0 ? Math.round((weeklyCompletions / totalPossibleWeekly) * 100) : 0;
    const monthlyPercentage = totalPossibleMonthly > 0 ? Math.round((monthlyCompletions / totalPossibleMonthly) * 100) : 0;

    return {
      weeklyCompletions,
      monthlyCompletions,
      weeklyPercentage,
      monthlyPercentage,
      totalPossibleWeekly,
      totalPossibleMonthly
    };
  };

  const renderStats = () => {
    const activeHabits = habits.filter(h => h.isActive);
    const totalHabits = habits.length;
    const stats = calculateStats();
    
    return (
      <View style={styles.statsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Overview</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <MaterialIcons name="psychology" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {totalHabits}
            </Text>
            <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>
              Total Habits
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <MaterialIcons name="trending-up" size={24} color={theme.colors.success} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {activeHabits.length}
            </Text>
            <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>
              Active Habits
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 32 }]}>Progress</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <MaterialIcons name="calendar-view-week" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {stats.weeklyPercentage}%
            </Text>
            <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>
              This Week
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <MaterialIcons name="calendar-today" size={24} color={theme.colors.secondary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {stats.monthlyPercentage}%
            </Text>
            <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>
              This Month
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHabits = () => {
    if (habits.length === 0) return null;

    return (
      <View style={styles.habitsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Habits</Text>
        {habits.map((habit) => (
          <View key={habit.id} style={[styles.habitCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.habitColorDot, { backgroundColor: habit.color }]} />
            <View style={styles.habitInfo}>
              <Text style={[styles.habitName, { color: theme.colors.text }]}>
                {habit.name}
              </Text>
              <Text style={[styles.habitStatus, { color: theme.colors.textSecondary }]}>
                {habit.isActive ? 'Active' : 'Paused'} • {habit.frequency} days
              </Text>
            </View>
            <MaterialIcons 
              name={habit.isActive ? "check-circle" : "pause-circle-filled"} 
              size={24} 
              color={habit.isActive ? theme.colors.success : theme.colors.textSecondary} 
            />
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialIcons name="analytics" size={48} color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading analytics...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <MaterialIcons name="insights" size={24} color="#ffffff" />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="insights" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.textSecondary }]}>No data to analyze</Text>
            <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
              Start tracking habits to see your progress analytics!
            </Text>
          </View>
        ) : (
          <>
            {renderStats()}
            {renderHabits()}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  overviewContainer: {
    marginBottom: 32,
  },
  statsGrid: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
    gap: 8,
  },
  streaksContainer: {
    marginBottom: 32,
  },
  streakItem: {
    marginBottom: 12,
  },
  streakCard: {
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakInfo: {
    flex: 1,
  },
  streakName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  streakNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },
  streakRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chartsContainer: {
    marginBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '400',
    marginTop: 2,
  },
  statsContainer: {
    marginBottom: 24,
  },
  habitsContainer: {
    marginBottom: 24,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  habitColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  habitStatus: {
    fontSize: 13,
  },
});
