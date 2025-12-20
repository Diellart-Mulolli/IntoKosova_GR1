import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SettingsScreen from "@/app/(tabs)/settings";

/* ================= MOCKS ================= */

// Mock Theme Context
jest.mock("@/contexts/ThemeContext", () => ({
  useThemeManager: () => ({
    setTheme: jest.fn(),
  }),
}));

// Mock React Navigation theme
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

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Expo modules
jest.mock("expo-notifications", () => ({}));
jest.mock("expo-application", () => ({
  nativeApplicationVersion: "1.0.0",
}));
jest.mock("expo-clipboard", () => ({}));

// 🔴 KRITIKE – mock IconSymbol (expo-symbols issue)
jest.mock("@/components/ui/icon-symbol", () => ({
  IconSymbol: () => null,
}));

// Disable animations
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

// SafeAreaView mock
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaView: ({ children }: any) => <>{children}</>,
  };
});

/* ========================================= */

describe("SettingsScreen – Snapshot tests", () => {
  it("renders default Settings screen", () => {
    const tree = render(<SettingsScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders Notifications modal (default OFF)", () => {
    const screen = render(<SettingsScreen />);

    // Open Notifications modal
    fireEvent.press(screen.getByText("Notifications"));

    expect(screen.toJSON()).toMatchSnapshot();
  });

  it("renders Theme selection modal", () => {
    const screen = render(<SettingsScreen />);

    // Open Theme modal
    fireEvent.press(screen.getByText("Theme"));

    expect(screen.toJSON()).toMatchSnapshot();
  });
});
