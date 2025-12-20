// __tests__/settings.test.tsx

import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from "@testing-library/react-native";
import SettingsScreen from "@/app/(tabs)/settings";
import { useThemeManager } from "@/contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Clipboard from "expo-clipboard";

// Mock-et
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

jest.mock("@/contexts/ThemeContext", () => ({
  useThemeManager: jest.fn(),
}));

jest.mock("@react-navigation/native", () => ({
  useTheme: () => ({
    dark: false,
    colors: {
      primary: "#3182CE",
      text: "#000000",
      textSecondary: "#666666",
      background: "#FFFFFF",
    },
  }),
}));

// RREGULLIMI I ALERT-IT (kryesor!)
global.alert = jest.fn(); // Mock alert global

describe("SettingsScreen", () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    (useThemeManager as jest.Mock).mockReturnValue({
      setTheme: mockSetTheme,
    });

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    jest.clearAllMocks();
  });

  it("renders all setting options correctly", () => {
    render(<SettingsScreen />);

    expect(screen.getByText("Settings")).toBeTruthy();
    expect(screen.getByText("Customize your app experience")).toBeTruthy();

    expect(screen.getByText("Notifications")).toBeTruthy();
    expect(screen.getByText("Theme")).toBeTruthy();
    expect(screen.getByText("About")).toBeTruthy();
    expect(screen.getByText("Accessibility")).toBeTruthy();
    expect(screen.getByText("Reset Progress")).toBeTruthy();
  });

  it("opens and closes Notifications modal with switch", async () => {
    render(<SettingsScreen />);

    // Merr vetëm butonin e Notifications (jo titullin e modalit)
    const notificationsButton = screen.getAllByText("Notifications")[0];
    fireEvent.press(notificationsButton);

    // Pritim që të shfaqet titulli i modalit
    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeTruthy(); // tani është OK, sepse jemi brenda modalit
      expect(screen.getByText("Enable Notifications")).toBeTruthy();
    });

    const switchElement = screen.getByRole("switch");
    expect(switchElement.props.value).toBe(false);

    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });

    fireEvent(switchElement, "onValueChange", true);

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

  it("changes theme when selecting a theme option", async () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByText("Theme"));

    await waitFor(() => {
      expect(screen.getByText("Choose Theme")).toBeTruthy();
      expect(screen.getByText("Light Mode")).toBeTruthy(); // hiq emoji për stabilitet
      expect(screen.getByText("Dark Mode")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Dark Mode"));

    expect(mockSetTheme).toHaveBeenCalledWith("dark");

    await waitFor(() => {
      expect(screen.queryByText("Choose Theme")).toBeNull();
    });
  });

  it("copies email to clipboard in About section", async () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByText("About"));

    await waitFor(() => {
      expect(screen.getByText("About This App")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("intoKosovateam@gmail.com"));

    // Verifikojmë që u thirr Clipboard dhe alert
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
      "intoKosovateam@gmail.com"
    );
    expect(global.alert).toHaveBeenCalledWith("Email copied to clipboard!");
  });
});
