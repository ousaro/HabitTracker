import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { PieChart } from 'react-native-chart-kit';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Habit, HabitEntry, HabitStreak } from '../types';
import { StorageService } from '../services/StorageService';
import { HabitStatsService } from '../services/HabitStatsService';
import { AnalyticsService } from '../services/AnalyticsService';
import { HabitsStackParamList } from '../navigation/HabitsStackNavigator';
import { useTheme } from '../theme/ThemeProvider';
import { formatDate } from '../utils/helpers';

const { width } = Dimensions.get('window');

interface HabitDetailScreenProps {
  navigation: StackNavigationProp<HabitsStackParamList, 'HabitDetail'>;
  route: RouteProp<HabitsStackParamList, 'HabitDetail'>;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, delay }) => {
  const { theme } = useTheme();
  
  return (
    <Animatable.View animation="fadeInUp" delay={delay} style={styles.statCardContainer}>
      <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
          <MaterialIcons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
          <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.statSubtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </Animatable.View>
  );
};

export const HabitDetailScreen: React.FC<HabitDetailScreenProps> = ({ navigation, route }) => {
  const { habitId } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [habit, setHabit] = useState<Habit | null>(null);
  const [streak, setStreak] = useState<HabitStreak | null>(null);
  const [recentEntries, setRecentEntries] = useState<HabitEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadHabitData = useCallback(async () => {
    try {
      // Get habit details
      const habits = await StorageService.getHabits();
      const foundHabit = habits.find(h => h.id === habitId);
      
      if (!foundHabit) {
        navigation.goBack();
        return;
      }
      
      setHabit(foundHabit);
      
      // Get streak data
      const streakData = await AnalyticsService.getHabitStreak(habitId);
      setStreak(streakData);
      
      // Get weekly completion data
      const weekData = await HabitStatsService.getWeeklyCompletionData(habitId);
      setWeeklyData(weekData);
      
      // Get recent entries (last 7 days)
      const entries: HabitEntry[] = [];
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
        const dateString = formatDate(date);
        const dayEntries = await StorageService.getHabitEntriesForDate(dateString);
        const habitEntry = dayEntries.find(e => e.habitId === habitId);
        
        if (habitEntry) {
          entries.push(habitEntry);
        }
      }
      
      setRecentEntries(entries);
      
      // Calculate total completions and total days
      const allEntries = await StorageService.getAllHabitEntries();
      const habitEntries = allEntries.filter(entry => entry.habitId === habitId && entry.completed);
      setTotalCompletions(habitEntries.length);
      
      // Calculate total days since habit creation (more accurate calculation)
      const createdDate = new Date(foundHabit.createdAt);
      const todayDate = new Date();
      
      // Reset time to start of day for accurate day calculation
      createdDate.setHours(0, 0, 0, 0);
      todayDate.setHours(0, 0, 0, 0);
      
      const timeDiff = todayDate.getTime() - createdDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include the creation day
      setTotalDays(Math.max(1, daysDiff)); // Ensure at least 1 day
      
    } catch (error) {
      console.error('Error loading habit data:', error);
    } finally {
      setLoading(false);
    }
  }, [habitId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadHabitData();
    }, [loadHabitData])
  );

  const handleEdit = () => {
    if (habit) {
      navigation.navigate('EditHabit', { habit });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getFrequencyText = (habit: Habit) => {
    if (habit.frequency === 'daily') return 'Daily';
    if (habit.frequency === 'weekly' && habit.targetDays) {
      return `${habit.targetDays.length} days/week`;
    }
    return habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1);
  };

  const formatCreatedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderCompletionChart = () => {
    if (!habit || totalDays === 0) {
      return null;
    }

    const completedDays = totalCompletions;
    const incompleteDays = totalDays - totalCompletions;

    // Show a different view for new habits (first day)
    if (totalDays === 1 && completedDays === 0) {
      return (
        <Animatable.View animation="fadeInUp" delay={700} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Completion Overview
          </Text>
          <View style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
            <MaterialIcons name="timeline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyChartTitle, { color: theme.colors.text }]}>
              Just Getting Started!
            </Text>
            <Text style={[styles.emptyChartSubtitle, { color: theme.colors.textSecondary }]}>
              Your completion data will appear here as you build your habit.
            </Text>
          </View>
        </Animatable.View>
      );
    }

    const pieData = [
      {
        name: 'Completed',
        population: completedDays,
        color: habit.color,
        legendFontColor: theme.colors.text,
        legendFontSize: 14,
      },
      {
        name: 'Incomplete',
        population: incompleteDays,
        color: theme.colors.error || '#ef4444',
        legendFontColor: theme.colors.text,
        legendFontSize: 14,
      },
    ];

    // Only show chart if there's meaningful data
    if (completedDays === 0 && incompleteDays <= 1) {
      return (
        <Animatable.View animation="fadeInUp" delay={700} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Completion Overview
          </Text>
          <View style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
            <MaterialIcons name="timeline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyChartTitle, { color: theme.colors.text }]}>
              No completions yet
            </Text>
            <Text style={[styles.emptyChartSubtitle, { color: theme.colors.textSecondary }]}>
              Complete this habit to see your progress visualization.
            </Text>
          </View>
        </Animatable.View>
      );
    }

    return (
      <Animatable.View animation="fadeInUp" delay={700} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Completion Overview
        </Text>
        <View style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
          <PieChart
            data={pieData}
            width={width - 80}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
          <View style={styles.chartStats}>
            <View style={styles.chartStatItem}>
              <View style={[styles.chartColorDot, { backgroundColor: habit.color }]} />
              <Text style={[styles.chartStatText, { color: theme.colors.text }]}>
                Completed: {completedDays} days
              </Text>
            </View>
            <View style={styles.chartStatItem}>
              <View style={[styles.chartColorDot, { backgroundColor: theme.colors.error || '#ef4444' }]} />
              <Text style={[styles.chartStatText, { color: theme.colors.text }]}>
                Incomplete: {incompleteDays} days
              </Text>
            </View>
            <View style={styles.chartStatItem}>
              <MaterialIcons name="trending-up" size={16} color={habit.color} />
              <Text style={[styles.chartStatText, { color: theme.colors.text, fontWeight: '600' }]}>
                Success Rate: {totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0}%
              </Text>
            </View>
          </View>
        </View>
      </Animatable.View>
    );
  };

  if (loading || !habit) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialIcons name="hourglass-empty" size={48} color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading habit details...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[habit.color, `${habit.color}CC`]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.habitHeader}>
            <View style={styles.habitIconContainer}>
              <MaterialIcons name={habit.icon as any} size={32} color="#ffffff" />
            </View>
            <View style={styles.habitHeaderInfo}>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitFrequency}>{getFrequencyText(habit)}</Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <MaterialIcons name="edit" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        {habit.description && (
          <Text style={styles.habitDescription}>{habit.description}</Text>
        )}
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Current Streak"
            value={streak?.currentStreak || 0}
            subtitle="days"
            icon="local-fire-department"
            color="#f97316"
            delay={100}
          />
          
          <StatCard
            title="Best Streak"
            value={streak?.longestStreak || 0}
            subtitle="days"
            icon="emoji-events"
            color="#eab308"
            delay={200}
          />
          
          <StatCard
            title="Completed Days"
            value={totalCompletions}
            subtitle={`of ${totalDays} day${totalDays === 1 ? '' : 's'}`}
            icon="check-circle"
            color="#22c55e"
            delay={300}
          />
          
          <StatCard
            title="Success Rate"
            value={`${totalDays > 0 ? Math.round((totalCompletions / totalDays) * 100) : 0}%`}
            subtitle="overall"
            icon="trending-up"
            color="#3b82f6"
            delay={400}
          />
        </View>

        {/* Completion Chart */}
        {renderCompletionChart()}

        {/* Weekly Progress */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            This Week's Progress
          </Text>
          <View style={[styles.weeklyProgress, { backgroundColor: theme.colors.surface }]}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, dayIndex) => {
              // Get the current week's start (Sunday)
              const today = new Date();
              const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
              const startOfWeek = new Date(today.getTime() - (currentDayOfWeek * 24 * 60 * 60 * 1000));
              const targetDate = new Date(startOfWeek.getTime() + (dayIndex * 24 * 60 * 60 * 1000));
              
              // Find the completion status for this specific day
              const daysFromToday = Math.floor((today.getTime() - targetDate.getTime()) / (24 * 60 * 60 * 1000));
              const weeklyDataIndex = 6 - daysFromToday; // weeklyData[6] is today, [0] is 6 days ago
              const isCompleted = weeklyDataIndex >= 0 && weeklyDataIndex < 7 && weeklyData[weeklyDataIndex] === 1;
              const isToday = dayIndex === currentDayOfWeek;
              
              return (
                <View
                  key={dayIndex}
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: isCompleted 
                        ? habit.color 
                        : theme.colors.background,
                      borderColor: isToday 
                        ? habit.color 
                        : theme.colors.border,
                      borderWidth: isToday ? 2 : 1,
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: isCompleted 
                          ? '#ffffff' 
                          : isToday 
                            ? habit.color 
                            : theme.colors.textSecondary
                      }
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animatable.View>

        {/* Habit Info */}
        <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Habit Information
          </Text>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.infoRow}>
              <MaterialIcons name="category" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Category</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{habit.category}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="schedule" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Frequency</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {getFrequencyText(habit)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Created</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatCreatedDate(habit.createdAt)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons 
                name={habit.isActive ? 'play-circle' : 'pause-circle'} 
                size={20} 
                color={theme.colors.textSecondary} 
              />
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Status</Text>
              <Text style={[styles.infoValue, { color: habit.isActive ? '#22c55e' : '#f97316' }]}>
                {habit.isActive ? 'Active' : 'Paused'}
              </Text>
            </View>
          </View>
        </Animatable.View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  habitIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  habitHeaderInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  habitFrequency: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  habitDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 16,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCardContainer: {
    width: (width - 44) / 2,
  },
  statCard: {
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statInfo: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  weeklyProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  chartStats: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
  chartStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  chartStatText: {
    fontSize: 14,
    flex: 1,
  },
  emptyChartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyChartSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
