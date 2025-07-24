export interface HabitCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const HABIT_CATEGORIES: HabitCategory[] = [
  {
    id: 'study',
    name: 'Study',
    icon: 'school',
    color: '#42A5F5', // Blue Habit
    description: 'Learning and educational activities'
  },
  {
    id: 'religion',
    name: 'Religion',
    icon: 'mosque',
    color: '#AB47BC', // Purple Habit
    description: 'Spiritual and religious practices'
  },
  {
    id: 'sport',
    name: 'Sport',
    icon: 'fitness-center',
    color: '#66BB6A', // Green Habit
    description: 'Physical exercise and fitness'
  },
  {
    id: 'quit-bad-habit',
    name: 'Quit Bad Habit',
    icon: 'cancel',
    color: '#EF5350', // Red Habit
    description: 'Breaking negative habits'
  },
  {
    id: 'art',
    name: 'Art',
    icon: 'palette',
    color: '#FFA726', // Orange Habit
    description: 'Creative activities and artistic pursuits'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'movie',
    color: '#AB47BC', // Purple Habit
    description: 'Fun and recreational activities'
  },
  {
    id: 'social',
    name: 'Social',
    icon: 'people',
    color: '#26A69A', // Teal Blue
    description: 'Social interactions and relationships'
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: 'account-balance-wallet',
    color: '#66BB6A', // Green Habit
    description: 'Money management and financial goals'
  },
  {
    id: 'health',
    name: 'Health',
    icon: 'local-hospital',
    color: '#EF5350', // Red Habit
    description: 'Healthcare and medical activities'
  },
  {
    id: 'work',
    name: 'Work',
    icon: 'work',
    color: '#42A5F5', // Blue Habit
    description: 'Professional and career development'
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    icon: 'restaurant',
    color: '#66BB6A', // Green Habit
    description: 'Diet and eating habits'
  },
  {
    id: 'home',
    name: 'Home',
    icon: 'home',
    color: '#FFA726', // Orange Habit
    description: 'Household and domestic activities'
  },
  {
    id: 'outdoor',
    name: 'Outdoor',
    icon: 'nature',
    color: '#66BB6A', // Green Habit
    description: 'Outdoor activities and nature'
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'category',
    color: '#BDBDBD', // Gray for other
    description: 'Miscellaneous activities'
  }
];

export const getCategoryById = (id: string): HabitCategory | undefined => {
  return HABIT_CATEGORIES.find(category => category.id === id);
};

export const getCategoryByName = (name: string): HabitCategory | undefined => {
  return HABIT_CATEGORIES.find(category => category.name.toLowerCase() === name.toLowerCase());
};
