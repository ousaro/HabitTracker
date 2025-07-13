# 🎯 HabitTracker - React Native Expo App

A beautiful, intuitive, and feature-rich habit tracking mobile application built with React Native, TypeScript, and Expo. Track your daily habits, visualize your progress, and build lasting positive routines with comprehensive analytics and insights.

![App Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)
![Expo](https://img.shields.io/badge/Expo-~53.0.17-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-~5.8.3-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📸 Screenshots

<!-- TODO: Add screenshots here -->
*Screenshots will be added here showcasing the main features and UI*

### Home Screen
[Screenshot placeholder - Dashboard with today's habits and progress overview]

### Habits Management
[Screenshot placeholder - Habit list with drag-and-drop functionality]

### Habit Details
[Screenshot placeholder - Detailed habit statistics and progress charts]

### Analytics Dashboard
[Screenshot placeholder - Comprehensive analytics and insights]

### Add/Edit Habit
[Screenshot placeholder - Habit creation and editing interface]

## ✨ Features

### 🏠 Dashboard & Overview
- **Daily Progress Tracking**: Quick overview of today's habit completion status
- **Weekly & Monthly Insights**: Track your progress over different time periods
- **Completion Statistics**: Visual progress indicators and percentage tracking
- **Quick Actions**: Mark habits as complete directly from the dashboard

### 📝 Habit Management
- **Create Custom Habits**: Set up personalized habits with names, descriptions, and categories
- **Flexible Scheduling**: Support for daily, weekly, and custom frequency patterns
- **Visual Customization**: Choose from a variety of colors and icons for each habit
- **Habit Categories**: Organize habits into predefined categories (Health, Productivity, Personal, etc.)
- **Drag & Drop Ordering**: Customize the order of your habits with intuitive drag-and-drop functionality
- **Active/Inactive States**: Temporarily disable habits without losing historical data

### 📊 Analytics & Insights
- **Streak Tracking**: Monitor current and longest streaks for each habit
- **Success Rate Analysis**: Detailed completion percentage calculations
- **Progress Charts**: Visual representation of habit completion over time
- **Historical Data**: Access complete history of habit completions
- **Comparative Analytics**: Compare performance across different habits and time periods

### 🎨 User Experience
- **Dark/Light Theme Support**: Automatic theme switching based on system preferences
- **Smooth Animations**: Enhanced user interactions with React Native Reanimated
- **Responsive Design**: Optimized for different screen sizes and orientations
- **Intuitive Navigation**: Bottom tab navigation with clear visual indicators
- **Safe Area Optimization**: Proper handling of device notches and status bars

### 💾 Data Management
- **Local Storage**: Secure data persistence using AsyncStorage
- **Offline Support**: Full functionality without internet connection
- **Data Export**: Future support for data backup and restore
- **Sample Data**: Demo habits for new users to explore the app

## 🛠️ Technology Stack

### Core Technologies
- **React Native** `0.79.5` - Cross-platform mobile development
- **TypeScript** `~5.8.3` - Type-safe JavaScript development
- **Expo** `~53.0.17` - Development platform and build tools

### Navigation & State Management
- **React Navigation** `^7.1.14` - Screen navigation and routing
- **Bottom Tabs Navigator** `^7.4.2` - Tab-based navigation
- **Stack Navigator** `^7.4.2` - Stack-based screen transitions

### UI & Styling
- **React Native Reanimated** `~3.17.4` - Smooth animations and gestures
- **React Native Gesture Handler** `~2.24.0` - Touch gesture recognition
- **Expo Linear Gradient** `^14.1.5` - Beautiful gradient backgrounds
- **Expo Vector Icons** `^14.1.0` - Comprehensive icon library

### Data Visualization
- **React Native Chart Kit** `^6.12.0` - Charts and data visualization
- **React Native SVG** `15.11.2` - Scalable vector graphics support

### Storage & Utilities
- **AsyncStorage** `2.1.2` - Local data persistence
- **React Native Draggable FlatList** `^4.0.3` - Drag-and-drop functionality
- **React Native Animatable** `^1.4.0` - Pre-built animation components

## 🚀 Getting Started

### Prerequisites
- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **Expo CLI** (`npm install -g @expo/cli`)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ousaro/HabitTracker.git
   cd HabitTracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Run on your device**
   - Install the **Expo Go** app on your mobile device
   - Scan the QR code displayed in your terminal or browser
   - Alternatively, use an emulator:
     ```bash
     npm run android  # For Android emulator
     npm run ios      # For iOS simulator (macOS only)
     ```

### Quick Start with Expo Go
For the fastest setup experience, use the included VS Code task:
- Open the project in VS Code
- Use the command palette (`Ctrl+Shift+P`) and run "Tasks: Run Task"
- Select "Start Expo Go Mode" to automatically start with Expo Go optimization

## 📁 Project Structure

```
HabitTrackerExpo/
├── 📱 App.tsx                 # Main application component
├── 📋 index.ts                # Entry point
├── ⚙️ app.json                # Expo configuration
├── 🔧 package.json            # Dependencies and scripts
├── 📝 tsconfig.json           # TypeScript configuration
├── 🎨 babel.config.js         # Babel configuration
├── 🚀 eas.json                # Expo Application Services config
├── 🖼️ assets/                 # App icons, splash screens, images
│   ├── icon.png
│   ├── splash-icon.png
│   └── adaptive-icon.png
└── 📦 src/
    ├── 🧩 components/         # Reusable UI components
    │   ├── HabitCard.tsx      # Individual habit display component
    │   └── StatsCard.tsx      # Statistics display component
    ├── 📊 constants/          # App constants and configurations
    │   └── habitCategories.ts # Predefined habit categories
    ├── 🧭 navigation/         # Navigation configuration
    │   └── HabitsStackNavigator.tsx
    ├── 📱 screens/            # Main application screens
    │   ├── HomeScreen.tsx     # Dashboard and overview
    │   ├── HabitsScreen.tsx   # Habit list and management
    │   ├── AddHabitScreen.tsx # Habit creation and editing
    │   ├── HabitDetailScreen.tsx # Individual habit details
    │   └── AnalyticsScreen.tsx # Analytics and insights
    ├── 🔧 services/           # Business logic and data services
    │   ├── StorageService.ts  # Data persistence management
    │   ├── AnalyticsService.ts # Analytics calculations
    │   ├── HabitStatsService.ts # Habit statistics
    │   └── SampleDataService.ts # Demo data generation
    ├── 🎨 theme/              # Theming and styling
    │   ├── index.ts           # Theme definitions
    │   └── ThemeProvider.tsx  # Theme context provider
    ├── 📐 types/              # TypeScript type definitions
    │   └── index.ts           # Core interfaces and types
    └── 🛠️ utils/              # Utility functions
        └── helpers.ts         # Common helper functions
```

## 🔧 Configuration

### Expo Configuration
The app is configured through `app.json` with:
- Custom app icons and splash screens
- Proper orientation settings
- Status bar styling
- Build configurations for different platforms

### TypeScript Configuration
Strict TypeScript configuration with:
- Path mapping for cleaner imports
- Strict type checking
- React Native and Expo type definitions

### Build Configuration
EAS (Expo Application Services) configuration for:
- Development builds
- Preview releases
- Production builds for app stores

## 📊 Key Features Breakdown

### Habit Data Model
```typescript
interface Habit {
  id: string;                    // Unique identifier
  name: string;                  // Habit name
  description?: string;          // Optional description
  color: string;                 // Visual theme color
  icon: string;                  // Icon identifier
  category: string;              // Categorization
  frequency: 'daily' | 'weekly' | 'custom'; // Scheduling
  targetDays?: number[];         // Weekly schedule (0-6, Sunday-Saturday)
  targetCount?: number;          // Custom frequency target
  reminderTime?: string;         // Future reminder functionality
  createdAt: string;             // Creation timestamp
  isActive: boolean;             // Active/inactive state
  completionPercentage?: number; // Current completion rate
  order?: number;                // Custom sorting order
}
```

### Analytics Capabilities
- **Streak Tracking**: Current and longest streak calculations
- **Completion Rates**: Daily, weekly, and monthly success percentages
- **Progress Trends**: Historical completion data visualization
- **Comparative Analysis**: Cross-habit performance insights
- **Goal Achievement**: Target vs. actual completion tracking

### Storage Architecture
- **Local-First Approach**: All data stored locally using AsyncStorage
- **Efficient Data Structure**: Optimized JSON storage for performance
- **Migration Support**: Future-proof data structure for updates
- **Backup Ready**: Structured for easy export/import functionality

## 🎯 Usage Guide

### Creating Your First Habit
1. Navigate to the **Habits** tab
2. Tap the **"Add Habit"** button
3. Fill in habit details:
   - Choose a descriptive name
   - Select an appropriate category
   - Pick a color and icon
   - Set your frequency (daily, weekly, or custom)
4. Save and start tracking!

### Tracking Daily Progress
1. From the **Home** screen, view today's habits
2. Tap the checkmark to mark habits as complete
3. View your progress percentage and streak information
4. Access detailed statistics by tapping on any habit

### Customizing Habit Order
1. Go to the **Habits** screen
2. Long-press and drag any habit using the drag handle (≡)
3. Reorder habits according to your preferences
4. Your custom order is automatically saved

### Analyzing Your Progress
1. Navigate to the **Analytics** tab
2. View comprehensive statistics across all habits
3. Analyze trends, streaks, and completion rates
4. Identify patterns and areas for improvement

## 🛡️ Data Privacy & Security

- **Local Storage Only**: All data remains on your device
- **No External Servers**: No personal data transmitted to external services
- **Privacy by Design**: Built with user privacy as a core principle
- **Secure Storage**: Uses React Native's secure storage mechanisms

## 🔮 Roadmap & Future Features

### Near-term Enhancements (v1.1)
- [ ] **Push Notifications**: Habit reminders and motivational messages
- [ ] **Widget Support**: Home screen widgets for quick habit checking
- [ ] **Data Export/Import**: Backup and restore functionality
- [ ] **Habit Templates**: Pre-built habit templates for common goals

### Medium-term Features (v1.2)
- [ ] **Social Features**: Share progress with friends and family
- [ ] **Habit Challenges**: Time-limited challenges and goals
- [ ] **Advanced Analytics**: Machine learning insights and predictions
- [ ] **Integration APIs**: Connect with fitness trackers and health apps

### Long-term Vision (v2.0)
- [ ] **Cloud Sync**: Optional cloud synchronization across devices
- [ ] **Community Features**: Public habit tracking and motivation
- [ ] **Gamification**: Points, badges, and achievement systems
- [ ] **AI Coaching**: Personalized habit formation recommendations

## 🤝 Contributing

We welcome contributions to make HabitTracker even better! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Create a Pull Request

### Contribution Guidelines
- Follow the existing code style and TypeScript conventions
- Add tests for new features
- Update documentation for significant changes
- Ensure all existing tests pass
- Keep commits focused and atomic

### Areas for Contribution
- 🐛 **Bug Fixes**: Help identify and resolve issues
- ✨ **New Features**: Implement items from the roadmap
- 📚 **Documentation**: Improve guides and API documentation
- 🎨 **UI/UX**: Design improvements and accessibility enhancements
- 🧪 **Testing**: Increase test coverage and quality
- 🌐 **Localization**: Add support for additional languages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** for the excellent development platform
- **React Native Community** for the robust ecosystem
- **Open Source Contributors** whose libraries make this app possible
- **Beta Testers** who provided valuable feedback during development

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/ousaro/HabitTracker/issues)
- **Discussions**: [Join community discussions](https://github.com/ousaro/HabitTracker/discussions)
- **Email**: [Contact the developer](mailto:your-email@example.com)

## 🔗 Links

- **Live Demo**: [Expo Snack Preview](https://snack.expo.dev/@yourusername/habittracker)
- **Download**: [Get it on Google Play](#) | [Download on App Store](#)
- **Website**: [Project Homepage](#)
- **Documentation**: [Full API Documentation](#)

---

**Built with ❤️ by [Your Name](https://github.com/ousaro)**

*Start building better habits today with HabitTracker!*
