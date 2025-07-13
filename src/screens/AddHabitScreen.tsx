import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Habit } from '../types';
import { StorageService } from '../services/StorageService';
import { generateId, getWeekDays } from '../utils/helpers';
import { HabitsStackParamList } from '../navigation/HabitsStackNavigator';
import { useTheme } from '../theme/ThemeProvider';
import { HABIT_CATEGORIES, getCategoryById, HabitCategory } from '../constants/habitCategories';

type AddHabitScreenNavigationProp = StackNavigationProp<HabitsStackParamList, 'AddHabit' | 'EditHabit'>;
type AddHabitScreenRouteProp = RouteProp<HabitsStackParamList, 'AddHabit' | 'EditHabit'>;

interface Props {
  navigation: AddHabitScreenNavigationProp;
  route: AddHabitScreenRouteProp;
}

export const AddHabitScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  
  // Check if we're editing an existing habit
  const editingHabit = route.params && 'habit' in route.params ? route.params.habit : null;
  const isEditing = !!editingHabit;

  const [name, setName] = useState(editingHabit?.name || '');
  const [description, setDescription] = useState(editingHabit?.description || '');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>(
    editingHabit ? getCategoryById(editingHabit.category) || HABIT_CATEGORIES[0] : HABIT_CATEGORIES[0]
  );
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>(editingHabit?.frequency || 'daily');
  const [selectedDays, setSelectedDays] = useState<number[]>(editingHabit?.targetDays || []);
  const [reminderTime, setReminderTime] = useState(editingHabit?.reminderTime || '');
  const [loading, setLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const weekDays = getWeekDays();

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    if (frequency === 'weekly' && selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day for weekly habits');
      return;
    }

    setLoading(true);

    try {
      const habitData: Omit<Habit, 'id' | 'createdAt'> = {
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedCategory.color,
        icon: selectedCategory.icon,
        category: selectedCategory.id,
        frequency,
        targetDays: frequency === 'weekly' ? selectedDays : undefined,
        reminderTime: reminderTime || undefined,
        isActive: true,
        completionPercentage: 0,
      };

      if (isEditing && editingHabit) {
        // Update existing habit
        const updatedHabit: Habit = {
          ...editingHabit,
          ...habitData,
        };
        await StorageService.updateHabit(updatedHabit);
        
        Alert.alert(
          'Success',
          'Habit updated successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        // Create new habit
        const newHabit: Habit = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          ...habitData,
        };
        
        await StorageService.addHabit(newHabit);
        
        Alert.alert(
          'Success',
          'Habit created successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error saving habit:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} habit. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => {
      if (prev.includes(dayIndex)) {
        return prev.filter(d => d !== dayIndex);
      } else {
        return [...prev, dayIndex];
      }
    });
  };

  const renderCategoryPicker = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Category</Text>
      
      {/* Category Dropdown Button */}
      <TouchableOpacity
        onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
        style={[
          styles.dropdownButton,
          { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }
        ]}
      >
        <View style={styles.dropdownButtonContent}>
          <View style={[
            styles.categoryIconContainer,
            { backgroundColor: `${selectedCategory.color}20` }
          ]}>
            <MaterialIcons
              name={selectedCategory.icon as any}
              size={20}
              color={selectedCategory.color}
            />
          </View>
          <View style={styles.dropdownButtonText}>
            <Text style={[styles.categoryName, { color: theme.colors.text }]}>
              {selectedCategory.name}
            </Text>
            <Text style={[styles.categoryDescription, { color: theme.colors.textSecondary }]}>
              {selectedCategory.description}
            </Text>
          </View>
          <MaterialIcons
            name={showCategoryDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color={theme.colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Category Dropdown List */}
      {showCategoryDropdown && (
        <ScrollView 
          style={[styles.dropdownList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          {HABIT_CATEGORIES.map((item: HabitCategory) => {
            const isSelected = selectedCategory.id === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  setSelectedCategory(item);
                  setShowCategoryDropdown(false);
                }}
                style={[
                  styles.dropdownItem,
                  { 
                    backgroundColor: isSelected ? `${item.color}20` : 'transparent',
                  }
                ]}
              >
                <View style={styles.categoryContent}>
                  <View style={[
                    styles.categoryIconContainer,
                    { backgroundColor: `${item.color}20` }
                  ]}>
                    <MaterialIcons
                      name={item.icon as any}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <View style={styles.categoryTextContainer}>
                    <Text style={[
                      styles.categoryName,
                      { color: theme.colors.text }
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={[
                      styles.categoryDescription,
                      { color: theme.colors.textSecondary }
                    ]}>
                      {item.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={item.color}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  const renderFrequencyPicker = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Frequency</Text>
      <View style={styles.frequencyOptions}>
        {(['daily', 'weekly'] as const).map(freq => (
          <TouchableOpacity
            key={freq}
            onPress={() => {
              setFrequency(freq);
              if (freq === 'daily') {
                setSelectedDays([]);
              }
            }}
            style={[
              styles.frequencyOption,
              { 
                backgroundColor: frequency === freq ? selectedCategory.color : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[
              styles.frequencyOptionText,
              { 
                color: frequency === freq ? '#ffffff' : theme.colors.text,
              },
            ]}>
              {freq.charAt(0).toUpperCase() + freq.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {frequency === 'weekly' && (
        <View style={styles.weekDaysContainer}>
          <Text style={[styles.weekDaysTitle, { color: theme.colors.text }]}>Select Days</Text>
          <View style={styles.weekDays}>
            {weekDays.map(day => (
              <TouchableOpacity
                key={day.index}
                onPress={() => toggleDay(day.index)}
                style={[
                  styles.dayOption,
                  {
                    backgroundColor: selectedDays.includes(day.index) ? selectedCategory.color : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[
                  styles.dayOptionText,
                  { 
                    color: selectedDays.includes(day.index) ? '#ffffff' : theme.colors.text,
                  },
                ]}>
                  {day.shortName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[selectedCategory.color, `${selectedCategory.color}CC`]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Habit' : 'New Habit'}</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Habit Name</Text>
          <TextInput
            style={[
              styles.textInput, 
              { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }
            ]}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Drink 8 glasses of water"
            placeholderTextColor={theme.colors.textSecondary}
            maxLength={50}
          />
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Description (Optional)</Text>
          <TextInput
            style={[
              styles.textInput, 
              styles.textArea,
              { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description to help you remember why this habit matters..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {renderCategoryPicker()}
        {renderFrequencyPicker()}

        <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Reminder Time (Optional)</Text>
          <TextInput
            style={[
              styles.textInput,
              { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }
            ]}
            value={reminderTime}
            onChangeText={setReminderTime}
            placeholder="HH:MM (e.g., 09:00)"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={styles.saveButton}
        >
          <LinearGradient
            colors={[selectedCategory.color, `${selectedCategory.color}CC`]}
            style={styles.saveButtonGradient}
          >
            {loading ? (
              <Text style={styles.saveButtonText}>{isEditing ? 'Updating...' : 'Creating...'}</Text>
            ) : (
              <>
                <MaterialIcons name="check" size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>{isEditing ? 'Update Habit' : 'Create Habit'}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyOption: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  frequencyOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekDaysContainer: {
    marginTop: 20,
  },
  weekDaysTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  weekDays: {
    flexDirection: 'row',
    gap: 8,
  },
  dayOption: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  dayOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  categoryOption: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  dropdownButton: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownButtonText: {
    flex: 1,
    marginLeft: 12,
  },
  dropdownList: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 300,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
});
