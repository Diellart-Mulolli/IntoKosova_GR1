import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Pressable,
  View,
  Modal,
  TouchableOpacity,
  Switch,
  Text,
} from "react-native";
import * as Notifications from "expo-notifications";
import * as Application from "expo-application";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useThemeManager } from "@/contexts/ThemeContext";
import { useTheme } from "@react-navigation/native";

export default function SettingsScreen() {
  const { setTheme } = useThemeManager();
  const { dark: isDark, colors } = useTheme();

  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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

  const settingsOptions = [
    {
      id: 1,
      title: "Notifications",
      icon: "bell.fill",
      action: () => setNotifModalVisible(true),
    },
    {
      id: 2,
      title: "Theme",
      icon: "paintpalette.fill",
      action: () => setThemeModalVisible(true),
    },
    {
      id: 3,
      title: "About",
      icon: "info.circle",
      action: () => setAboutModalVisible(true),
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
      action: () => console.log("Reset Progress pressed"),
    },
  ];

  const renderOptionCard = (option, index) => (
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

      {/* NOTIFICATIONS MODAL */}
      <Modal visible={notifModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              { backgroundColor: isDark ? "#222" : "#fff" },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Notifications
            </Text>

            <View style={styles.switchRow}>
              <Text style={[styles.modalOption, { color: colors.text }]}>
                Enable Notifications
              </Text>

              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                thumbColor={notificationsEnabled ? colors.primary : "#888"}
              />
            </View>

            {notificationsEnabled && (
              <TouchableOpacity onPress={sendTestNotification}>
                <Text style={[styles.testNotif, { color: colors.primary }]}>
                  ▶ Send Test Notification
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setNotifModalVisible(false)}
            >
              <Text style={{ color: colors.text }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ABOUT MODAL */}
      <Modal visible={aboutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              { backgroundColor: isDark ? "#222" : "#fff" },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              About This App
            </Text>

            <Text
              style={[styles.aboutText, { color: isDark ? "#F5F5DC" : "#000" }]}
            >
              Version: {Application.nativeApplicationVersion || "1.0.0"}
            </Text>

            <Text style={[styles.aboutDesc, { color: colors.text }]}>
              This application showcases the beauty of Kosovo through photos,
              categories, and user collections. Built with ❤️ by your developer.
            </Text>

            <TouchableOpacity
              onPress={() => {
                Clipboard.setStringAsync("intoKosovateam@gmail.com");
                alert("Email copied to clipboard!");
              }}
            >
              <Text style={[styles.aboutLink, { color: colors.primary }]}>
                📧 intoKosovateam@gmail.com
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setAboutModalVisible(false)}
            >
              <Text style={{ color: colors.text }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* THEME MODAL */}
      <Modal
        visible={themeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              { backgroundColor: isDark ? "#222" : "#fff" },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Choose Theme
            </Text>

            <TouchableOpacity
              onPress={() => {
                setTheme("light");
                setThemeModalVisible(false);
              }}
            >
              <Text style={[styles.modalOption, { color: colors.text }]}>
                🌞 Light Mode
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setTheme("dark");
                setThemeModalVisible(false);
              }}
            >
              <Text style={[styles.modalOption, { color: colors.text }]}>
                🌙 Dark Mode
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setTheme("system");
                setThemeModalVisible(false);
              }}
            >
              <Text style={[styles.modalOption, { color: colors.text }]}>
                🖥 System Default
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setThemeModalVisible(false)}
            >
              <Text style={{ color: colors.text }}>Close</Text>
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },

  modalOption: {
    fontSize: 18,
    paddingVertical: 10,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },

  modalClose: {
    marginTop: 20,
    alignSelf: "flex-end",
  },

  testNotif: {
    fontSize: 16,
    marginTop: 10,
  },

  aboutText: {
    fontSize: 16,
    marginBottom: 6,
  },

  aboutDesc: {
    fontSize: 16,
    marginVertical: 10,
    lineHeight: 22,
  },

  aboutLink: {
    fontSize: 16,
    marginTop: 10,
    textDecorationLine: "underline",
  },
});
