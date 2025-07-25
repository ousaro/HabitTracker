export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    card: string;
    shadow: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#26A69A', // Teal Blue
    secondary: '#42A5F5', // Blue
    background: '#FAFAFA', // Soft white
    surface: '#FFFFFF',
    text: '#212121', // Dark gray/black
    textSecondary: '#757575',
    border: '#E0E0E0',
    success: '#66BB6A', // Green
    warning: '#FFA726', // Orange
    error: '#EF5350', // Red
    card: '#FFFFFF',
    shadow: 'rgba(255, 255, 255, 0.)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#26A69A', // Teal Blue
    secondary: '#42A5F5', // Blue
    background: '#121212', // Dark Gray
    surface: '#1E1E1E', // Slightly lighter dark
    text: '#E0E0E0', // Light Gray
    textSecondary: '#BDBDBD',
    border: '#424242',
    success: '#66BB6A', // Green
    warning: '#FFA726', // Orange
    error: '#EF5350', // Red
    card: '#1E1E1E',
    shadow: 'rgba(255, 255, 255, 0.)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
};
