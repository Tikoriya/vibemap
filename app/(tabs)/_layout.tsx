import {
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import { Redirect, Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { Map, MapPin, User } from 'lucide-react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { FontFamily } from '@/constants/Typography';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/lib/store';

// Nested cities-stack routes that should take over the full screen (no tab bar).
const FULLSCREEN_CITIES_ROUTES = ['create', 'label', '[spotid]'];

type NestedRoute = {
  name?: string;
  state?: {
    routes: NestedRoute[];
    index: number;
  };
};

function getDeepestFocusedRouteName(route: NestedRoute): string {
  let current: NestedRoute = route;

  while (current.state?.routes && current.state.index != null) {
    const nestedRoute: NestedRoute | undefined =
      current.state.routes[current.state.index];
    if (!nestedRoute) break;
    current = nestedRoute;
  }

  return getFocusedRouteNameFromRoute(current) ?? current.name ?? 'index';
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuthStore();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const defaultTabBarStyle = Platform.select({
    ios: {
      position: 'absolute' as const,
      borderTopColor: theme.border,
    },
    default: {
      backgroundColor: theme.surface,
      borderTopColor: theme.border,
    },
  });

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarLabelStyle: {
          fontFamily: FontFamily.semiBold,
          fontSize: 11,
        },
        tabBarStyle: defaultTabBarStyle,
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="cities"
        options={({ route }) => {
          const focused = getDeepestFocusedRouteName(route);
          const hideTabBar = FULLSCREEN_CITIES_ROUTES.includes(focused);
          return {
            title: 'Cities',
            tabBarIcon: ({ color }) => <Map size={24} color={color} />,
            tabBarStyle: hideTabBar ? { display: 'none' } : defaultTabBarStyle,
          };
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <MapPin size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
