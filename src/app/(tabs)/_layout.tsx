import { Tabs } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import type { ColorValue } from "react-native";

import { colors } from "../../theme/colors";

type TabIconName = SymbolViewProps["name"];

const tabIcons: Record<string, TabIconName> = {
  upload: {
    ios: "square.and.arrow.up",
    android: "upload",
    web: "upload",
  },
  wardrobe: {
    ios: "hanger",
    android: "checkroom",
    web: "checkroom",
  },
  outfits: {
    ios: "person.crop.rectangle.stack",
    android: "styler",
    web: "styler",
  },
};

function TabIcon({ color, name }: { color: ColorValue; name: TabIconName }) {
  return <SymbolView name={name} size={24} tintColor={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="upload"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          borderTopColor: colors.border.subtle,
          backgroundColor: colors.surface.app,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={tabIcons.upload} />
          ),
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: "Wardrobe",
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={tabIcons.wardrobe} />
          ),
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: "Outfits",
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={tabIcons.outfits} />
          ),
        }}
      />
    </Tabs>
  );
}
