import React from "react";
import renderer, { act } from "react-test-renderer";
import SettingsScreen from "@/app/(screens)/SettingsScreen";
import { Pressable, Text } from "react-native";

// ================= MOCKS =================

// Theme Context
jest.mock("@/contexts/ThemeContext", () => ({
  useThemeManager: () => ({
    setTheme: jest.fn(),
  }),
}));

// React Navigation Theme
jest.mock("@react-navigation/native", () => ({
  useTheme: () => ({
    dark: false,
    colors: {
      background: "#ffffff",
      text: "#000000",
      textSecondary: "#666666",
      primary: "#1e90ff",
    },
  }),
}));

// AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

// Expo Notifications
jest.mock("expo-notifications", () => ({
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  scheduleNotificationAsync: jest.fn(),
}));

// Expo Application
jest.mock("expo-application", () => ({
  nativeApplicationVersion: "1.0.0",
}));

// Clipboard
jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
}));

// Reanimated (disable animations)
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

// SafeAreaView
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaView: ({ children }: any) => <>{children}</>,
  };
});

// =========================================

describe("SettingsScreen – Snapshot tests", () => {
  it("renders default Settings screen", () => {
    const tree = renderer.create(<SettingsScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders Notifications modal (default OFF)", async () => {
    const component = renderer.create(<SettingsScreen />);

    const notificationsButton = component.root
      .findAllByType(Pressable)
      .find((node) =>
        node
          .findAllByType(Text)
          .some((t) => t.props.children === "Notifications")
      );

    await act(async () => {
      notificationsButton?.props.onPress();
    });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it("renders Theme selection modal", async () => {
    const component = renderer.create(<SettingsScreen />);

    const themeButton = component.root
      .findAllByType(Pressable)
      .find((node) =>
        node.findAllByType(Text).some((t) => t.props.children === "Theme")
      );

    await act(async () => {
      themeButton?.props.onPress();
    });

    expect(component.toJSON()).toMatchSnapshot();
  });
});
