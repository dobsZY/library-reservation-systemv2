import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

/** Üst bar / marka kırmızısı */
const ADMIN_HEADER_RED = '#DC2626';
/** Açık kırmızı zemin üzerinde okunaklı ikon ve sekme yazısı */
const ADMIN_TAB_ACTIVE = '#991B1B';

const TAB_ICON_BOX = 40;

function AdminTabBarIcon({
  name,
  nameOutline,
  focused,
  inactiveColor,
}: {
  name: keyof typeof Ionicons.glyphMap;
  nameOutline: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  inactiveColor: string;
}) {
  const iconName = focused ? name : nameOutline;
  const iconColor = focused ? ADMIN_TAB_ACTIVE : inactiveColor;

  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={iconName} size={24} color={iconColor} />
    </View>
  );
}

export default function AdminTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ADMIN_TAB_ACTIVE,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 72,
          paddingBottom: 8,
          paddingTop: 6,
          ...styles.tabBarShadow,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
          minWidth: 0,
        },
        headerStyle: {
          backgroundColor: ADMIN_HEADER_RED,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
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
          title: 'Panel',
          headerTitle: 'Yönetici Paneli',
          tabBarIcon: ({ color, focused }) => (
            <AdminTabBarIcon
              name="stats-chart"
              nameOutline="stats-chart-outline"
              focused={focused}
              inactiveColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Rezervasyon',
          headerTitle: 'Rezervasyon Yönetimi',
          tabBarIcon: ({ color, focused }) => (
            <AdminTabBarIcon
              name="calendar"
              nameOutline="calendar-outline"
              focused={focused}
              inactiveColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="halls"
        options={{
          title: 'Salonlar',
          headerTitle: 'Salon & Masa Yönetimi',
          tabBarIcon: ({ color, focused }) => (
            <AdminTabBarIcon
              name="grid"
              nameOutline="grid-outline"
              focused={focused}
              inactiveColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Kullanıcılar',
          headerTitle: 'Kullanıcı Yönetimi',
          tabBarIcon: ({ color, focused }) => (
            <AdminTabBarIcon
              name="people"
              nameOutline="people-outline"
              focused={focused}
              inactiveColor={color}
            />
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
  iconWrap: {
    width: TAB_ICON_BOX,
    height: TAB_ICON_BOX,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'visible',
  },
  iconWrapActive: {
    backgroundColor: '#FEE2E2',
  },
});
