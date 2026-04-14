import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { staffBackofficeTheme } from '../../constants/staffTheme';
import { colors } from '../../constants/theme';
import { BackofficeCapabilitiesProvider } from '../../context/BackofficeCapabilitiesContext';

const TAB_ICON_BOX = 40;
const t = staffBackofficeTheme;

function StaffTabBarIcon({
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
  const iconColor = focused ? t.primary : inactiveColor;

  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={iconName} size={24} color={iconColor} />
    </View>
  );
}

export default function StaffTabLayout() {
  const caps = useMemo(
    () => ({
      variant: 'staff' as const,
      allowCancelReservation: false,
      allowTableEdit: false,
    }),
    [],
  );

  return (
    <BackofficeCapabilitiesProvider value={caps}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: t.primary,
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
            backgroundColor: t.headerBackground,
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
            title: t.panelTabLabel,
            headerTitle: t.panelHeaderTitle,
            tabBarIcon: ({ color, focused }) => (
              <StaffTabBarIcon
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
            headerTitle: 'Rezervasyonlar',
            tabBarIcon: ({ color, focused }) => (
              <StaffTabBarIcon
                name="calendar"
                nameOutline="calendar-outline"
                focused={focused}
                inactiveColor={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="qr-desk"
          options={{
            title: 'QR Tara',
            headerTitle: 'Masa QR',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <StaffTabBarIcon
                name="qr-code"
                nameOutline="qr-code-outline"
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
            headerTitle: 'Salonlar ve masalar',
            tabBarIcon: ({ color, focused }) => (
              <StaffTabBarIcon
                name="grid"
                nameOutline="grid-outline"
                focused={focused}
                inactiveColor={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="masa-kontrol"
          options={{
            href: null,
            title: 'Masa kontrolü',
            headerTitle: 'Masa kontrolü',
          }}
        />
      </Tabs>
    </BackofficeCapabilitiesProvider>
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
    backgroundColor: staffBackofficeTheme.primaryLight,
  },
});
