import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import DraggableFlatList, {
  ScaleDecorator,
  ShadowDecorator,
  OpacityDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { StackNavigationProp } from '@react-navigation/stack';
import { Habit } from '../types';
import { StorageService } from '../services/StorageService';
import { HabitsStackParamList } from '../navigation/HabitsStackNavigator';
import { useTheme } from '../theme/ThemeProvider';

interface HabitListItemProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  onToggleActive: (habit: Habit) => void;
  onPress: (habit: Habit) => void;
  animationDelay: number;
  drag?: () => void;
  isActive?: boolean;
  isDragMode: boolean;
}

const HabitListItem: React.FC<HabitListItemProps> = ({
  habit,
  onEdit,
  onDelete,
  onToggleActive,
  onPress,
  animationDelay,
  drag,
  isActive: isDragging,
  isDragMode,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  React.useEffect(() => {
    if (isDragging) {
      scale.value = withSpring(1.05, {
        damping: 15,
        stiffness: 200,
      });
      opacity.value = withSpring(0.9, {
        damping: 15,
        stiffness: 200,
      });
    } else {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      opacity.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
    }
  }, [isDragging]);
  
  return (
    <ScaleDecorator>
      <OpacityDecorator activeOpacity={0.8}>
        <ShadowDecorator>
          <Animated.View style={[animatedStyle]}>
            <Animatable.View
              animation="fadeInRight"
              delay={animationDelay}
              duration={600}
              style={[
                styles.habitItem, 
                { 
                  backgroundColor: theme.colors.surface,
                  borderRadius: 16,
                }
              ]}
            >
        <TouchableOpacity
          onPress={() => onPress(habit)}
          onLongPress={isDragMode ? drag : undefined}
          delayLongPress={isDragMode ? 200 : 500}
          activeOpacity={0.7}
          style={styles.habitTouchable}
          disabled={isDragging}
        >
        <View
          style={[
            styles.habitCard,
            isDragMode && styles.habitCardDragMode,
            isDragging && styles.habitCardDragging
          ]}
        >
          <View style={styles.habitContent}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: !habit.isActive ? 'rgba(255,255,255,0.2)' : `${habit.color}20` }
            ]}>
              <MaterialIcons
                name={habit.icon as any}
                size={24}
                color={!habit.isActive ? '#ffffff' : habit.color}
              />
            </View>
            
            <View style={styles.habitInfo}>
              <Text style={[
                styles.habitName,
                { color: !habit.isActive ? '#ffffff' : theme.colors.text }
              ]}>
                {habit.name}
              </Text>
              {habit.description && (
                <Text style={[
                  styles.habitDescription,
                  { color: !habit.isActive ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary }
                ]}>
                  {habit.description}
                </Text>
              )}
              <Text style={[
                styles.habitFrequency,
                { color: !habit.isActive ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary }
              ]}>
                {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                {habit.frequency === 'weekly' && habit.targetDays && 
                  ` • ${habit.targetDays.length} days/week`
                }
              </Text>
            </View>
            
            <View style={styles.habitActions}>
              {isDragMode && (
                <View style={[
                  styles.dragHandle,
                  { backgroundColor: !habit.isActive ? 'rgba(255,255,255,0.2)' : `${habit.color}20` }
                ]}>
                  <MaterialIcons
                    name="drag-indicator"
                    size={16}
                    color={habit.isActive ? 'rgba(255,255,255,0.7)' : habit.color}
                  />
                </View>
              )}

              <TouchableOpacity
                onPress={(e: any) => {
                  e.stopPropagation();
                  onToggleActive(habit);
                }}
                style={[
                  styles.actionButton,
                  { backgroundColor: !habit.isActive ? 'rgba(255,255,255,0.2)' : `${habit.color}20` }
                ]}
              >
                <MaterialIcons
                  name={habit.isActive ? 'pause' : 'play-arrow'}
                  size={20}
                  color={!habit.isActive ? '#ffffff' : habit.color}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={(e: any) => {
                  e.stopPropagation();
                  onEdit(habit);
                }}
                style={[
                  styles.actionButton,
                  { backgroundColor: !habit.isActive ? 'rgba(255,255,255,0.2)' : `${habit.color}20` }
                ]}
              >
                <MaterialIcons
                  name="edit"
                  size={20}
                  color={!habit.isActive ? '#ffffff' : habit.color}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={(e: any) => {
                  e.stopPropagation();
                  onDelete(habit);
                }}
                style={[
                  styles.actionButton,
                  { backgroundColor: !habit.isActive ? 'rgba(255,255,255,0.2)' : '#ef444420' }
                ]}
              >
                <MaterialIcons
                  name="delete"
                  size={20}
                  color={!habit.isActive ? 'rgba(255,255,255,0.8)' : '#ef4444'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
            </Animatable.View>
          </Animated.View>
        </ShadowDecorator>
      </OpacityDecorator>
    </ScaleDecorator>
  );
};

export const HabitsScreen: React.FC<{
  navigation: StackNavigationProp<HabitsStackParamList, 'HabitsList'>;
}> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDragMode, setIsDragMode] = useState(false);

  const loadHabits = async () => {
    try {
      const allHabits = await StorageService.getHabits();
      // Sort habits by order, then by creation date
      const sortedHabits = allHabits.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      setHabits(sortedHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHabits();
    setRefreshing(false);
  }, []);
  const handleAddHabit = () => {
    navigation.navigate('AddHabit');
  };

  const handleEditHabit = (habit: Habit) => {
    navigation.navigate('EditHabit', { habit });
  };

  const handleDeleteHabit = (habit: Habit) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteHabit(habit.id);
              await loadHabits();
            } catch (error) {
              console.error('Error deleting habit:', error);
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (habit: Habit) => {
    try {
      const updatedHabit = { ...habit, isActive: !habit.isActive };
      await StorageService.updateHabit(updatedHabit);
      await loadHabits();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const handleHabitPress = (habit: Habit) => {
    navigation.navigate('HabitDetail', { habitId: habit.id });
  };

  const handleDragEnd = async ({ data }: { data: Habit[] }) => {
    setHabits(data);
    await StorageService.updateHabitsOrder(data);
  };

  const renderHabitItem = ({ item: habit, drag, isActive }: RenderItemParams<Habit>) => (
    <HabitListItem
      habit={habit}
      onEdit={handleEditHabit}
      onDelete={handleDeleteHabit}
      onToggleActive={handleToggleActive}
      onPress={handleHabitPress}
      animationDelay={0}
      drag={drag}
      isActive={isActive}
      isDragMode={isDragMode}
    />
  );

  // Create a single data array with sections
  const createFlatListData = () => {
    const data: any[] = [];
    
    // Add drag mode indicator
    if (isDragMode) {
      data.push({ type: 'dragIndicator' });
    }
    
    // Add empty state or habits
    if (habits.length === 0) {
      data.push({ type: 'emptyState' });
    } else {
      // Add active habits section
      if (activeHabits.length > 0) {
        data.push({ type: 'sectionHeader', title: `Active Habits (${activeHabits.length})` });
        data.push({ type: 'activeHabits', habits: activeHabits });
      }
      
      // Add inactive habits section  
      if (inactiveHabits.length > 0) {
        data.push({ type: 'sectionHeader', title: `Paused Habits (${inactiveHabits.length})` });
        data.push({ type: 'inactiveHabits', habits: inactiveHabits });
      }
    }
    
    return data;
  };

  const renderFlatListItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'dragIndicator':
        return (
          <View style={[styles.dragModeIndicator, { backgroundColor: theme.colors.primary + '20' }]}>
            <MaterialIcons name="drag-indicator" size={16} color={theme.colors.primary} />
            <Text style={[styles.dragModeText, { color: theme.colors.primary }]}>
              Drag mode active - Long press and drag to reorder - Side scroll
            </Text>
          </View>
        );
        
      case 'emptyState':
        return (
          <View style={styles.emptyState}>
            <MaterialIcons name="psychology" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>No habits yet</Text>
            <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
              Start your journey by creating your first habit!
            </Text>
            <TouchableOpacity onPress={handleAddHabit} style={styles.createFirstButton}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.createFirstButtonGradient}
              >
                <MaterialIcons name="add" size={20} color="#ffffff" />
                <Text style={styles.createFirstButtonText}>Create First Habit</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );
        
      case 'sectionHeader':
        return (
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
        );
        
      case 'activeHabits':
        return (
          <DraggableFlatList
            data={item.habits}
            onDragEnd={({ data }: { data: Habit[] }) => {
              const updatedHabits = [...data, ...inactiveHabits];
              handleDragEnd({ data: updatedHabits });
            }}
            keyExtractor={(habit: Habit) => habit.id}
            renderItem={renderHabitItem}
            scrollEnabled={false}
            dragItemOverflow={false}
            activationDistance={isDragMode ? 0 : 50}
            dragHitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
            animationConfig={{
              damping: 20,
              stiffness: 150,
              mass: 0.2,
              restSpeedThreshold: 0.05,
              restDisplacementThreshold: 0.05,
            }}
          />
        );
        
      case 'inactiveHabits':
        return (
          <DraggableFlatList
            data={item.habits}
            onDragEnd={({ data }: { data: Habit[] }) => {
              const updatedHabits = [...activeHabits, ...data];
              handleDragEnd({ data: updatedHabits });
            }}
            keyExtractor={(habit: Habit) => habit.id}
            renderItem={renderHabitItem}
            scrollEnabled={false}
            dragItemOverflow={false}
            activationDistance={isDragMode ? 0 : 50}
            dragHitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
            animationConfig={{
              damping: 20,
              stiffness: 150,
              mass: 0.2,
              restSpeedThreshold: 0.05,
              restDisplacementThreshold: 0.05,
            }}
          />
        );
        
      default:
        return null;
    }
  };

  const activeHabits = habits.filter(h => h.isActive);
  const inactiveHabits = habits.filter(h => !h.isActive);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialIcons name="hourglass-empty" size={48} color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading habits...</Text>
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
          <Text style={styles.headerTitle}>My Habits</Text>
          <TouchableOpacity
            onPress={() => setIsDragMode(!isDragMode)}
            style={[
              styles.dragModeButton,
              { backgroundColor: isDragMode ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)' }
            ]}
          >
            <MaterialIcons
              name={isDragMode ? 'drag-indicator' : 'reorder'}
              size={20}
              color="rgba(255,255,255,0.9)"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={createFlatListData()}
        renderItem={renderFlatListItem}
        keyExtractor={(item, index) => `${item.type}_${index}`}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.colors.primary }]} 
        onPress={handleAddHabit}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
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
  dragModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dragModeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'currentColor',
  },
  dragModeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 16,
  },
  habitItem: {
    marginBottom: 12,
  },
  habitTouchable: {
    borderRadius: 16,
  },
  habitCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  habitCardDragMode: {
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderStyle: 'dashed',
  },
  habitCardDragging: {
    elevation: 8,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    transform: [{ scale: 1.02 }],
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  habitFrequency: {
    fontSize: 12,
    fontWeight: '500',
  },
  habitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  dragHandle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 32,
  },
  createFirstButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  createFirstButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createFirstButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
