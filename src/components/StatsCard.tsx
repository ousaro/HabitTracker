import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../theme/ThemeProvider';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
  animationDelay?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  animationDelay = 0,
}) => {
  const { theme } = useTheme();
  return (
    <Animatable.View
      animation="fadeInUp"
      delay={animationDelay}
      duration={600}
      style={styles.container}
    >
      <View
        style={[styles.card, { 
                backgroundColor: theme.colors.surface,
                borderRadius: 16,
            }]}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}30` }]}>
          <MaterialIcons name={icon as any} size={24} color={color} />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 4,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    minHeight: 100,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
