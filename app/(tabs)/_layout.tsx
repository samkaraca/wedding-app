import Ionicons from '@expo/vector-icons/Ionicons';
import {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();

// Wrap the navigator so Expo Router can hook into it
const MaterialTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

// Custom tab bar component to fix Android flickering issues
function CustomTabBar({ state, descriptors, navigation }: {
  state: TabNavigationState<ParamListBase>;
  descriptors: any;
  navigation: any;
}) {
  const insets = useSafeAreaInsets();
  const primaryColor = '#2196F3';

  return (
    <View style={[
      styles.tabBar,
      {
        paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E5E7EB',
      }
    ]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Get the icon based on route name
        const getIcon = () => {
          if (route.name === 'index') {
            return <Ionicons name="people" size={28} color={isFocused ? primaryColor : '#6B7280'} />;
          } else if (route.name === 'expenses') {
            return <Ionicons name="wallet" size={28} color={isFocused ? primaryColor : '#6B7280'} />;
          }
          return null;
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            {getIcon()}
            {isFocused && (
              <View style={[styles.indicator, { backgroundColor: primaryColor }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <MaterialTabs
      tabBarPosition="bottom"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
        // Remove default tabBar styles since we're using custom
      }}
    >
      <MaterialTabs.Screen
        name="index"
        options={{
          title: 'Davetliler',
          tabBarAccessibilityLabel: 'Davetliler',
        }}
      />
      <MaterialTabs.Screen
        name="expenses"
        options={{
          title: 'Giderler',
          tabBarAccessibilityLabel: 'Giderler',
        }}
      />
    </MaterialTabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 3,
    borderRadius: 2,
  },
});
