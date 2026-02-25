import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

// Badge component
const TabBarBadge = ({ count }: { count?: number }) => {
  if (!count) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          ...styles.tabBarShadow,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerTitleAlign: 'left',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Salonlar',
          headerTitle: 'Kütüphane Modülü',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeTab : null}>
              <Ionicons name={focused ? "library" : "library-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="halls"
        options={{
          title: 'Kroki',
          headerTitle: 'Salon Seçimi',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeTab : null}>
              <Ionicons name={focused ? "map" : "map-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reservation"
        options={{
          title: 'Rezervasyonlarım',
          headerTitle: 'Rezervasyonlarım',
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <View style={focused ? styles.activeTab : null}>
                <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
              </View>
              <TabBarBadge count={1} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hesabım',
          headerTitle: 'Hesap Bilgileri',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeTab : null}>
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  activeTab: {
    backgroundColor: colors.primaryLight,
    padding: 8,
    borderRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
