import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import SettingsScreen from "@/app/(tabs)/settings";
import { useThemeManager } from "@/contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Clipboard from "expo-clipboard";

// MOCKS

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock("expo-notifications", () => ({
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));

jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
}));

jest.mock("expo-application", () => ({
  applicationVersion: "mock",
}));

jest.mock("@/contexts/ThemeContext", () => ({
  useThemeManager: jest.fn(),
}));

jest.mock("@react-navigation/native", () => ({
  useTheme: () => ({
    dark: false,
    colors: {
      primary: "#3182CE",
      text: "#000",
      textSecondary: "#666",
      background: "#fff",
    },
  }),
}));

global.alert = jest.fn();
jest.spyOn(console, "warn").mockImplementation(() => {});

// TEST SUITE

describe("SettingsScreen", () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    (useThemeManager as jest.Mock).mockReturnValue({
      setTheme: mockSetTheme,
    });

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    jest.clearAllMocks();
  });

  // RENDER

  it("renders settings screen correctly", () => {
    render(<SettingsScreen />);

    expect(screen.getByText("Settings")).toBeTruthy();
    expect(screen.getByText(/customize your app experience/i)).toBeTruthy();

    expect(screen.getByText("Notifications")).toBeTruthy();
    expect(screen.getByText("Theme")).toBeTruthy();
    expect(screen.getByText("About")).toBeTruthy();
    expect(screen.getByText("Accessibility")).toBeTruthy();
    expect(screen.getByText("Reset Progress")).toBeTruthy();
  });

  // NOTIFICATIONS
   
  it("enables notifications and saves preference", async () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByText("Notifications"));

    await waitFor(() => {
      expect(screen.getByText("Enable Notifications")).toBeTruthy();
    });

    const toggle = screen.getByRole("switch");
    expect(toggle.props.value).toBe(false);

    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });

    fireEvent(toggle, "onValueChange", true);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "NOTIFICATIONS_ENABLED",
        "true"
      );
    });

    fireEvent.press(screen.getByText("Close"));

    await waitFor(() => {
      expect(screen.queryByText("Enable Notifications")).toBeNull();
    });
  });

  // THEME 

  it("changes theme to dark mode", async () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByText("Theme"));

    await waitFor(() => {
      expect(screen.getByText("Choose Theme")).toBeTruthy();
    });

    fireEvent.press(screen.getByText(/dark mode/i));

    expect(mockSetTheme).toHaveBeenCalledWith("dark");

    await waitFor(() => {
      expect(screen.queryByText("Choose Theme")).toBeNull();
    });
  });

  // ABOUT

  it("copies email to clipboard", async () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByText("About"));

    await waitFor(() => {
      expect(screen.getByText("About This App")).toBeTruthy();
    });

    fireEvent.press(screen.getByText(/intoKosovateam@gmail.com/i));

    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
      "intoKosovateam@gmail.com"
    );

    expect(global.alert).toHaveBeenCalledWith(
      "Email copied to clipboard!"
    );
  });
});
