import { createStackNavigator } from '@react-navigation/stack';
import { HabitsScreen } from '../screens/HabitsScreen';
import { AddHabitScreen } from '../screens/AddHabitScreen';
import { HabitDetailScreen } from '../screens/HabitDetailScreen';
import { Habit } from '../types';

export type HabitsStackParamList = {
  HabitsList: undefined;
  AddHabit: undefined;
  EditHabit: { habit: Habit };
  HabitDetail: { habitId: string };
};

const Stack = createStackNavigator<HabitsStackParamList>();

export const HabitsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // Enable smooth animations
        cardStyleInterpolator: ({ current }: { current: any }) => ({
          cardStyle: {
            opacity: current.progress,
          },
        }),
      }}
    >
      <Stack.Screen name="HabitsList" component={HabitsScreen} />
      <Stack.Screen name="AddHabit" component={AddHabitScreen} />
      <Stack.Screen name="EditHabit" component={AddHabitScreen} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
    </Stack.Navigator>
  );
};
