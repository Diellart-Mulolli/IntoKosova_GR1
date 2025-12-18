// app/_layout.tsx
import { Stack } from "expo-router";
import { ThemeProvider, useThemeManager } from "../contexts/ThemeContext";
import {
  ThemeProvider as NavigationThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function RootLayout() {
  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MainNavigation />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

function MainNavigation() {
  const { colorScheme } = useThemeManager();

  const navigationTheme = {
    ...(colorScheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: colorScheme === "dark" ? "#000" : "#fff",
      card: colorScheme === "dark" ? "#111" : "#fff",
      text: colorScheme === "dark" ? "#fff" : "#000",
      primary: colorScheme === "dark" ? "#1E90FF" : "#007AFF",
      border: colorScheme === "dark" ? "#222" : "#ccc",
    },
  };

  return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </NavigationThemeProvider>
  </GestureHandlerRootView>
  );
}
