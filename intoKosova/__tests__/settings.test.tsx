import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SettingsScreen from "@/app/(tabs)/settings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";

// ================= MOCKS =================

// Mock Theme Context
jest.mock("@/contexts/ThemeContext", () => ({
  useThemeManager: () => ({
    setTheme: jest.fn(),
  }),
}));

// Mock Navigation Theme
jest.mock("@react-navigation/native", () => ({
  useTheme: () => ({
    dark: false,
    colors: {
      background: "#fff",
      text: "#000",
      textSecondary: "#666",
      primary: "#007AFF",
    },
  }),
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Expo Notifications
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  scheduleNotificationAsync: jest.fn(),
  AndroidImportance: { MAX: 5 },
  AndroidNotificationPriority: { MAX: 2 },
}));

// Mock Clipboard & Application
jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
}));

jest.mock("expo-application", () => ({
  nativeApplicationVersion: "1.0.0",
}));

// Disable animations
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

describe("SettingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================= RENDER =================

  it("renders Settings header correctly", () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText("Settings")).toBeTruthy();
    expect(getByText("Customize your app experience")).toBeTruthy();
  });

  it("renders all settings options", () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText("Notifications")).toBeTruthy();
    expect(getByText("Theme")).toBeTruthy();
    expect(getByText("About")).toBeTruthy();
    expect(getByText("Accessibility")).toBeTruthy();
    expect(getByText("Reset Progress")).toBeTruthy();
  });

  // ================= MODAL OPEN =================

  it("opens Notifications modal when pressed", async () => {
    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText("Notifications"));

    await waitFor(() => {
      expect(getByText("Enable Notifications")).toBeTruthy();
    });
  });

  it("opens Theme modal when pressed", async () => {
    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText("Theme"));

    await waitFor(() => {
      expect(getByText("Choose Theme")).toBeTruthy();
      expect(getByText("🌞 Light Mode")).toBeTruthy();
      expect(getByText("🌙 Dark Mode")).toBeTruthy();
      expect(getByText("🖥 System Default")).toBeTruthy();
    });
  });

  it("opens About modal when pressed", async () => {
    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText("About"));

    await waitFor(() => {
      expect(getByText("About This App")).toBeTruthy();
      expect(getByText("Version: 1.0.0")).toBeTruthy();
    });
  });

  // ================= SWITCH / NOTIFICATIONS =================

  it("toggles notifications switch", async () => {
    const { getByText, getByRole } = render(<SettingsScreen />);

    fireEvent.press(getByText("Notifications"));

    const toggle = await waitFor(() => getByRole("switch"));

    fireEvent(toggle, "valueChange", true);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "NOTIFICATIONS_ENABLED",
        "true"
      );
    });
  });

  // ================= RESET PROGRESS =================

  it("opens reset modal and shows warning text", async () => {
    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText("Reset Progress"));

    await waitFor(() => {
      expect(getByText("Are you sure? This cannot be undone!")).toBeTruthy();
    });
  });

  it("clears AsyncStorage when reset is confirmed (native)", async () => {
    jest.spyOn(Alert, "alert").mockImplementation((...args: any[]) => {
      const buttons = args[2];
      if (!Array.isArray(buttons)) return;

      const deleteBtn = buttons.find((b: any) => b.text === "Delete");
      deleteBtn?.onPress();
    });

    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText("Reset Progress"));
    fireEvent.press(await waitFor(() => getByText("Delete Progress")));

    await waitFor(() => {
      expect(AsyncStorage.clear).toHaveBeenCalled();
    });
  });

  // ================= CLOSE MODAL =================

  it("closes modal when Close button is pressed", async () => {
    const { getByText, queryByText } = render(<SettingsScreen />);

    fireEvent.press(getByText("Notifications"));

    await waitFor(() => {
      expect(getByText("Enable Notifications")).toBeTruthy();
    });

    fireEvent.press(getByText("Close"));

    await waitFor(() => {
      expect(queryByText("Enable Notifications")).toBeNull();
    });
  });
});
