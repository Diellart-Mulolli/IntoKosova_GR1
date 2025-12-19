import { Tabs, router, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { GlassView } from "expo-glass-effect";
import { View, StyleSheet, Pressable } from "react-native";

const TAB_BAR_HEIGHT = 64;

const styles = StyleSheet.create({
  tabBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: TAB_BAR_HEIGHT,
  },
  glassContainer: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  plusButton: {
    fontSize: 60,
  },
  plusButtonActive: {
    backgroundColor: Colors.light.activeTint, // Light blue for active state
  },
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const [isCreateActive, setIsCreateActive] = useState(false);

  // Detect when the create screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener("state", (e) => {
      const currentRoute = e.data.state.routes[e.data.state.index];
      setIsCreateActive(currentRoute.name === "create");
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].activeTint, // Light blue for active tab
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].inactiveTint, // Inactive tabs
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: "absolute",
          height: TAB_BAR_HEIGHT,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={styles.tabBackground} pointerEvents="none">
            <GlassView
              tintColor={Colors[colorScheme ?? "light"].background}
              style={styles.glassContainer}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="homepage"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              style={styles.plusButton}
              size={28}
              name="circled.plus"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
