import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

const TAB_ICON_BOX = 40;

function TabBarIcon({
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
  // Aktif sekmede tabBarActiveTintColor ile aynı sarı ikon, açık sarı zemin üzerinde kayboluyor ve
  // Android (Fabric) bazen sarmalayıcı View'da kırpma yapıp ikonu "bozuk çizgi" gibi gösteriyor.
  const iconColor = focused ? colors.primaryDark : inactiveColor;

  return (
    <View
      style={[
        styles.iconWrap,
        focused && styles.iconWrapActive,
      ]}
    >
      <Ionicons name={iconName} size={24} color={iconColor} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primaryDark,
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
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="library" nameOutline="library-outline" focused={focused} inactiveColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="halls"
        options={{
          title: 'Kroki',
          headerTitle: 'Salon Seçimi',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="map" nameOutline="map-outline" focused={focused} inactiveColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservation"
        options={{
          title: 'Rezervasyon',
          headerTitle: 'Rezervasyonlarım',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="calendar" nameOutline="calendar-outline" focused={focused} inactiveColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hesabım',
          headerTitle: 'Hesap Bilgileri',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="person" nameOutline="person-outline" focused={focused} inactiveColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservation-history"
        options={{
          href: null, // Butonla acilan sayfa, tab bar'da gorunmesin
          title: 'Geçmiş Rezervasyonlarım',
          headerTitle: 'Geçmiş Rezervasyonlarım',
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
    backgroundColor: colors.primaryLight,
  },
});
