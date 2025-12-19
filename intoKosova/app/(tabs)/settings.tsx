import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Pressable,
  View,
  Modal,
  TouchableOpacity,
  Switch,
  Text,
  Alert,
  Platform,
} from "react-native";
import * as Notifications from "expo-notifications";
import * as Application from "expo-application";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useThemeManager } from "@/contexts/ThemeContext";
import { useTheme } from "@react-navigation/native";

export default function SettingsScreen() {
  const { setTheme } = useThemeManager();
  const { dark: isDark, colors } = useTheme();

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState<
    "notifications" | "theme" | "about" | "reset" | null
  >(null);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const openSection = (section: typeof currentSection) => {
    setCurrentSection(section);
    setSettingsModalVisible(true);
  };

  const closeModal = () => {
    setSettingsModalVisible(false);
    setTimeout(() => setCurrentSection(null), 300);
  };

  // Load saved notification preference
  useEffect(() => {
    AsyncStorage.getItem("NOTIFICATIONS_ENABLED").then((value) => {
      if (value !== null) setNotificationsEnabled(value === "true");
    });
  }, []);

  // Toggle notifications
  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Notifications permission denied.");
        return;
      }
    }

    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await AsyncStorage.setItem("NOTIFICATIONS_ENABLED", newValue.toString());
  };

  // Test notification
  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📩 Test Notification",
        body: "This is a test message!",
      },
      trigger: null,
    });
  };

  const handleResetProgress = useCallback(() => {
    const askConfirmation = (): Promise<boolean> => {
      if (Platform.OS === "web") {
        return Promise.resolve(
          window.confirm(
            "Are you sure you want to delete all your progress? This action cannot be undone."
          )
        );
      }

      return new Promise((resolve) => {
        Alert.alert(
          "Reset Progress",
          "Are you sure you want to delete all your progress? This action cannot be undone.",
          [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            {
              text: "Delete Progress",
              style: "destructive",
              onPress: () => resolve(true),
            },
          ],
          { cancelable: true }
        );
      });
    };

    askConfirmation().then(async (confirmed) => {
      if (!confirmed) return;

      try {
        await AsyncStorage.clear();

        if (Platform.OS === "web") {
          window.alert("Progress has been reset.");
          window.location.reload();
        } else {
          Alert.alert(
            "Success",
            "Your progress has been deleted successfully."
          );
        }
      } catch (e) {
        console.error("Error clearing AsyncStorage:", e);
        const errorMsg = "An error occurred while deleting progress.";
        Platform.OS === "web"
          ? window.alert(errorMsg)
          : Alert.alert("Error", errorMsg);
      }
    });
  }, []);

  const settingsOptions = [
    {
      id: 1,
      title: "Notifications",
      icon: "bell.fill",
      action: () => openSection("notifications"),
    },
    {
      id: 2,
      title: "Theme",
      icon: "paintpalette.fill",
      action: () => openSection("theme"),
    },
    {
      id: 3,
      title: "About",
      icon: "info.circle",
      action: () => openSection("about"),
    },
    {
      id: 4,
      title: "Accessibility",
      icon: "accessibility",
      action: () => console.log("Accessibility pressed"),
    },
    {
      id: 5,
      title: "Reset Progress",
      icon: "xmark",
      action: () => openSection("reset"),
    },
  ];

  const renderOptionCard = useCallback(
    (option, index) => (
      <Animated.View
        key={option.id}
        entering={FadeInDown.delay(index * 100).springify()}
      >
        <Pressable
          style={[
            styles.optionCard,
            {
              backgroundColor: isDark ? "#111" : "#F5F5F5",
              borderColor: isDark ? "#222" : "#E5E5E5",
              borderWidth: 1,
            },
          ]}
          onPress={option.action}
        >
          <View
            style={[
              styles.optionIcon,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(49,130,206,0.15)",
              },
            ]}
          >
            <IconSymbol name={option.icon} size={28} color={colors.primary} />
          </View>

          <ThemedText style={[styles.optionTitle, { color: colors.text }]}>
            {option.title}
          </ThemedText>
        </Pressable>
      </Animated.View>
    ),
    [colors, isDark]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
          Settings
        </ThemedText>

        <ThemedText
          style={[styles.headerSubtitle, { color: colors.textSecondary }]}
        >
          Customize your app experience
        </ThemedText>
      </Animated.View>

      <View style={styles.content}>
        {settingsOptions.map((option, index) =>
          renderOptionCard(option, index)
        )}
      </View>

      {/* SINGLE MODAL FOR ALL SECTIONS */}
      <Modal
        visible={settingsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              { backgroundColor: isDark ? "#222" : "#fff" },
            ]}
          >
            {/* TITLE - CENTERED */}
            <ThemedText
              style={[
                styles.modalTitle,
                { color: colors.text, textAlign: "center" },
              ]}
            >
              {currentSection === "notifications" && "Notifications"}
              {currentSection === "theme" && "Choose Theme"}
              {currentSection === "about" && "About This App"}
              {currentSection === "reset" && "Reset Progress"}
            </ThemedText>

            {/* CONTENT BASED ON SECTION */}
            {currentSection === "notifications" && (
              <View>
                <View style={styles.switchRow}>
                  <ThemedText style={{ color: colors.text }}>
                    Enable Notifications
                  </ThemedText>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={toggleNotifications}
                    thumbColor={notificationsEnabled ? colors.primary : "#888"}
                  />
                </View>

                {notificationsEnabled && (
                  <TouchableOpacity onPress={sendTestNotification}>
                    <ThemedText
                      style={{ color: colors.primary, marginTop: 10 }}
                    >
                      ▶ Send Test Notification
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {currentSection === "theme" && (
              <View>
                <TouchableOpacity
                  onPress={() => {
                    setTheme("light");
                    closeModal();
                  }}
                  style={styles.themeOption}
                >
                  <ThemedText style={{ color: colors.text }}>
                    🌞 Light Mode
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setTheme("dark");
                    closeModal();
                  }}
                  style={styles.themeOption}
                >
                  <ThemedText style={{ color: colors.text }}>
                    🌙 Dark Mode
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setTheme("system");
                    closeModal();
                  }}
                  style={styles.themeOption}
                >
                  <ThemedText style={{ color: colors.text }}>
                    🖥 System Default
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {currentSection === "about" && (
              <View>
                <ThemedText style={{ color: isDark ? "#F5F5DC" : "#000" }}>
                  Version: {Application.nativeApplicationVersion || "1.0.0"}
                </ThemedText>

                <ThemedText
                  style={{
                    color: colors.text,
                    marginVertical: 10,
                    lineHeight: 22,
                  }}
                >
                  This application showcases the beauty of Kosovo through
                  photos, categories, and user collections. Built with ❤️ by
                  your developer.
                </ThemedText>

                <TouchableOpacity
                  onPress={() => {
                    Clipboard.setStringAsync("intoKosovateam@gmail.com");
                    alert("Email copied to clipboard!");
                  }}
                >
                  <ThemedText style={{ color: colors.primary }}>
                    📧 intoKosovateam@gmail.com
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {currentSection === "reset" && (
              <View style={styles.resetContainer}>
                <ThemedText style={styles.resetWarningText}>
                  Are you sure you want to delete all your progress?{"\n"}
                  This action cannot be undone!
                </ThemedText>

                <TouchableOpacity
                  onPress={() => {
                    handleResetProgress();
                    closeModal();
                  }}
                  style={styles.deleteButton}
                >
                  <ThemedText style={styles.deleteButtonText}>
                    Delete Progress
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* CLOSE BUTTON - BOTTOM RIGHT */}
            <TouchableOpacity
              style={styles.closeButtonBottom}
              onPress={closeModal}
            >
              <ThemedText style={{ color: colors.primary, fontSize: 16 }}>
                Close
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },

  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  optionCard: {
    width: "100%",
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  optionIcon: {
    marginRight: 16,
    padding: 8,
    borderRadius: 10,
  },

  optionTitle: {
    fontSize: 18,
    fontWeight: "500",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },

  themeOption: {
    paddingVertical: 14,
    paddingHorizontal: 10,
  },

  resetContainer: {
    alignItems: "center",
    marginTop: 20,
  },

  resetWarningText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },

  deleteButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },

  deleteButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  closeButtonBottom: {
    marginTop: 30,
    alignSelf: "flex-end",
  },
});
