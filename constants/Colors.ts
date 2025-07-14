/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2196F3'; // Blue primary color
const tintColorDark = '#64B5F6'; // Lighter blue for dark mode

export const Colors = {
  light: {
    text: '#1E3A8A',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorLight,
    border: '#E5E7EB',
    card: '#F8FAFC',
    primary: '#2196F3',
    secondary: '#90CAF9',
    accent: '#1976D2',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
  dark: {
    text: '#ECEDEE',
    background: '#1A1A1A',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#2C2C2C',
    card: '#2C2C2C',
    primary: '#64B5F6',
    secondary: '#42A5F5',
    accent: '#1E88E5',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
};
