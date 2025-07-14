# Wedding App

This is a wedding invitation management app built with React Native and Expo Router.

## Features

- **Swipeable Tabs**: Navigate between "Davetliler" (Guests) and "Giderler" (Expenses) tabs by swiping or tapping
- **Guest Management**: Add, edit, and manage wedding guests
- **Expense Tracking**: Track wedding-related expenses
- **Cross-platform**: Works on both iOS and Android

## Android-Specific Fixes

The app includes specific fixes for Android compatibility:

1. **Safe Area Handling**: Uses `useSafeAreaInsets` from `react-native-safe-area-context` to ensure the bottom tab bar doesn't overlap with system navigation buttons
2. **Custom Tab Bar**: Implements a custom tab bar to prevent flickering issues that occur with Material Top Tabs positioned at the bottom on Android
3. **Proper Layout**: The tab bar is positioned correctly above the Android navigation bar

## Technical Implementation

- **Navigation**: Uses `@react-navigation/material-top-tabs` for swipeable tab navigation
- **Safe Areas**: Wrapped in `SafeAreaProvider` for proper safe area handling
- **Custom Components**: Custom tab bar implementation to fix Android-specific issues

## Getting Started

1. Install dependencies: `npm install`
2. Start the development server: `npm start`
3. Run on Android: `npm run android`
4. Run on iOS: `npm run ios`

## Architecture

- `/app/(tabs)/`: Tab-based navigation structure
- `/components/`: Reusable UI components
- `/hooks/`: Custom React hooks
- `/utils/`: Utility functions
- `/types/`: TypeScript type definitions
