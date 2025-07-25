import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Habit, HabitEntry } from '../types';
import { getStreakMessage } from '../utils/helpers';
import { useTheme } from '../theme/ThemeProvider';
import { getCategoryById } from '../constants/habitCategories';

interface HabitCardProps {
  habit: Habit;
  entry?: HabitEntry;
  streak?: number;
  onToggle: (habit: Habit) => void;
  onPress: (habit: Habit) => void;
  animationDelay?: number;
}

const { width } = Dimensions.get('window');

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  entry,
  streak = 0,
  onToggle,
  onPress,
  animationDelay = 0,
}) => {
  const { theme,isDark } = useTheme();
  const isCompleted = entry?.completed || false;
  const category = getCategoryById(habit.category);
  ;

  const getTextColor = () => {
    return theme.colors.text;
  };

  const getIconColor = () => {
    return !isCompleted ? '#ffffff' : habit.color;
  };

  const getSecondaryTextColor = () => {
    return theme.colors.textSecondary;
  };

  const getIconContainerColor = () => {
    return isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
  }

  return (
    <Animatable.View
      animation="fadeInUp"
      delay={animationDelay}
      duration={600}
      style={[styles.container]}
    >
      <TouchableOpacity
        onPress={() => onToggle(habit)}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <View
          style={[styles.card, { 
                backgroundColor: theme.colors.surface,
                shadowColor: theme.colors.shadow,
                borderColor: 'transparent',
            }]}
        >
          <View style={styles.content}>
            <View style={styles.leftContent}>
              <View style={[styles.iconContainer, { backgroundColor: !isCompleted ? getIconContainerColor() : `${habit.color}30` }]}>
                <MaterialIcons
                  name={(category?.icon || habit.icon) as any}
                  size={24}
                  color={getIconColor()}
                />
              </View>
              
              <View style={styles.textContent}>
                <Text
                  style={[styles.title, { color: getTextColor() }]}
                  numberOfLines={1}
                >
                  {habit.name}
                </Text>
                
                {habit.description && (
                  <Text
                    style={[styles.description, { color: getSecondaryTextColor() }]}
                    numberOfLines={1}
                  >
                    {habit.description}
                  </Text>
                )}
                
                <Text style={[styles.streak, { color: getSecondaryTextColor() }]}>
                  {getStreakMessage(streak)}
                </Text>
              </View>
            </View>

            <View style={styles.rightContent}>
              <View
                style={[
                  styles.checkButton,
                  {
                    backgroundColor: isCompleted ? `${habit.color}40` : 'rgba(0,0,0,0.05)',
                    borderColor: !isCompleted ? 'rgba(255,255,255,0.5)' : habit.color,
                  }
                ]}
              >
                {isCompleted && (
                  <MaterialIcons name="check" size={20} color="#ffffff" />
                )}
              </View>
              
              {habit.completionPercentage !== undefined && (
                <Text style={[styles.percentage, { color: getSecondaryTextColor() }]}>
                  {habit.completionPercentage}%
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  touchable: {
    width: '100%',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightContent: {
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
  textContent: {
    flex: 1,
    marginRight: 12,
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    marginBottom: 4,
  },
  streak: {
    fontSize: 12,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 11,
    fontWeight: '600',
  },
});
