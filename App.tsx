/**
 * HabitTracker - Mobile Habit Tracking App (Expo Version)
 * Built with React Native, TypeScript, and Expo
 */
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeScreen } from './src/screens/HomeScreen';
import { HabitsStackNavigator } from './src/navigation/HabitsStackNavigator';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { AnalyticsService } from './src/services/AnalyticsService';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Initialize analytics on app start
    const initializeApp = async () => {
      await AnalyticsService.calculateStreaks();
    };
    
    initializeApp();
  }, []);

  return (
    <>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.colors.primary} 
      />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }: { route: import('@react-navigation/native').RouteProp<Record<string, object | undefined>, string> }) => ({
            tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
              let iconName: keyof typeof MaterialIcons.glyphMap;
              
              switch (route.name) {
                case 'Home':
                  iconName = 'home';
                  break;
                case 'Habits':
                  iconName = 'psychology';
                  break;
                case 'Analytics':
                  iconName = 'analytics';
                  break;
                default:
                  iconName = 'circle';
              }
              
              return <MaterialIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textSecondary,
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              borderTopWidth: 0,
              elevation: 8,
              shadowColor: theme.colors.shadow,
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              height: 60 + insets.bottom,
              paddingBottom: insets.bottom + 8,
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginTop: 4,
            },
            headerShown: false,
          })}
          // Enable smooth tab press behavior to pop to top
          backBehavior="history"
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen 
            name="Habits" 
            component={HabitsStackNavigator}
            listeners={({ navigation }: { navigation: any }) => ({
              tabPress: (e: any) => {
                // Always prevent default and manually handle navigation
                e.preventDefault();
                
                // Get the current state
                const state = navigation.getState();
                const habitsTabIndex = state.routes.findIndex((route: any) => route.name === 'Habits');
                
                if (state.index === habitsTabIndex) {
                  // We're already on Habits tab - reset the stack to root
                  navigation.dispatch({
                    ...navigation.reset({
                      index: 0,
                      routes: [{ name: 'HabitsList' }],
                    }),
                    target: state.routes[habitsTabIndex].key,
                  });
                } else {
                  // Switch to Habits tab and ensure we're on root
                  navigation.navigate('Habits', { screen: 'HabitsList' });
                }
              },
            })}
          />
          <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
