import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeManager } from "@/contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import * as Application from "expo-application";
import * as Clipboard from "expo-clipboard";
import * as Notifications from "expo-notifications";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// KONFIGURIMI I HANDLER-IT (Lejon njoftimet kur app është i hapur)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function SettingsScreen() {
  const { setTheme } = useThemeManager();
  const { dark: isDark, colors } = useTheme();

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState<
    "notifications" | "theme" | "about" | "reset" | null
  >(null);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // 1. KRIJIMI I KANALIT PËR ANDROID DHE KONTROLLI I LEJEVE
  useEffect(() => {
    async function prepareNotifications() {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Kontrollo preferencën e ruajtur
      const saved = await AsyncStorage.getItem("NOTIFICATIONS_ENABLED");
      if (saved !== null) {
        setNotificationsEnabled(saved === "true");
      }
    }
    prepareNotifications();
  }, []);

  const openSection = (section: typeof currentSection) => {
    setCurrentSection(section);
    setSettingsModalVisible(true);
  };

  const closeModal = () => {
    setSettingsModalVisible(false);
    setTimeout(() => setCurrentSection(null), 300);
  };

  // 2. TOGGLE NOTIFICATIONS ME KËRKESË LEJEJE
  const toggleNotifications = async () => {
    if (Platform.OS === "web") {
      alert("Njoftimet nuk mbështeten në versionin Web.");
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        "Leja u refuzua", 
        "Duhet të aktivizoni njoftimet në Settings të telefonit për këtë aplikacion."
      );
      return;
    }

    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await AsyncStorage.setItem("NOTIFICATIONS_ENABLED", newValue.toString());
  };

  // 3. DËRGIMI I NJOFTIMIT TESTUES
  const sendTestNotification = async () => {
  if (Platform.OS === 'web') {
    alert("Njoftimet testuese punojnë vetëm në telefon.");
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📩 Test i Suksesshëm!",
        body: "Nëse e sheh këtë, njoftimet po punojnë saktë.",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      // Ndryshimi kryesor këtu:
      trigger: { 
        seconds: 2,
        channelId: 'default', // Duhet të përputhet me emrin te useEffect
      } as Notifications.NotificationTriggerInput, 
    });

    Alert.alert("Dërguar", "Njoftimi do të shfaqet pas 2 sekondave.");
  } catch (error) {
    console.error("Gabimi te njoftimi:", error);
    alert("Trigger-i nuk është i vlefshëm.");
  }
};

  const handleResetProgress = useCallback(() => {
    const askConfirmation = (): Promise<boolean> => {
      if (Platform.OS === "web") {
        return Promise.resolve(
          window.confirm("Are you sure you want to delete all your progress?")
        );
      }
      return new Promise((resolve) => {
        Alert.alert(
          "Reset Progress",
          "Are you sure? This cannot be undone.",
          [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            { text: "Delete", style: "destructive", onPress: () => resolve(true) },
          ]
        );
      });
    };

    askConfirmation().then(async (confirmed) => {
      if (!confirmed) return;
      await AsyncStorage.clear();
      Platform.OS === "web" ? window.location.reload() : Alert.alert("Success", "Progress deleted.");
    });
  }, []);

  const settingsOptions = [
    { id: 1, title: "Notifications", icon: "bell.fill", action: () => openSection("notifications") },
    { id: 2, title: "Theme", icon: "paintpalette.fill", action: () => openSection("theme") },
    { id: 3, title: "About", icon: "info.circle", action: () => openSection("about") },
    { id: 4, title: "Accessibility", icon: "accessibility", action: () => console.log("Pressed") },
    { id: 5, title: "Reset Progress", icon: "xmark", action: () => openSection("reset") },
  ];

  const renderOptionCard = useCallback((option: any, index: number) => (
    <Animated.View key={option.id} entering={FadeInDown.delay(index * 100).springify()}>
      <Pressable
        style={[styles.optionCard, { 
          backgroundColor: isDark ? "#111" : "#F5F5F5", 
          borderColor: isDark ? "#222" : "#E5E5E5", 
          borderWidth: 1 
        }]}
        onPress={option.action}
      >
        <View style={[styles.optionIcon, { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(49,130,206,0.15)" }]}>
          <IconSymbol name={option.icon} size={28} color={colors.primary} />
        </View>
        <ThemedText style={[styles.optionTitle, { color: colors.text }]}>{option.title}</ThemedText>
      </Pressable>
    </Animated.View>
  ), [colors, isDark]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Settings</ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Customize your app experience</ThemedText>
      </Animated.View>

      <View style={styles.content}>
        {settingsOptions.map((option, index) => renderOptionCard(option, index))}
      </View>

      <Modal visible={settingsModalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? "#222" : "#fff" }]}>
            <ThemedText style={[styles.modalTitle, { color: colors.text, textAlign: "center" }]}>
              {currentSection === "notifications" && "Notifications"}
              {currentSection === "theme" && "Choose Theme"}
              {currentSection === "about" && "About This App"}
              {currentSection === "reset" && "Reset Progress"}
            </ThemedText>

            {currentSection === "notifications" && (
              <View>
                <View style={styles.switchRow}>
                  <ThemedText style={{ color: colors.text }}>Enable Notifications</ThemedText>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={toggleNotifications}
                    thumbColor={notificationsEnabled ? colors.primary : "#888"}
                  />
                </View>
                {notificationsEnabled && (
                  <TouchableOpacity onPress={sendTestNotification} style={{ padding: 10, alignItems: 'center' }}>
                    <ThemedText style={{ color: colors.primary, fontWeight: 'bold' }}>▶ Send Test Notification</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {currentSection === "theme" && (
              <View>
                {['light', 'dark', 'system'].map((m) => (
                  <TouchableOpacity key={m} onPress={() => { setTheme(m as any); closeModal(); }} style={styles.themeOption}>
                    <ThemedText style={{ color: colors.text }}>
                      {m === 'light' ? "🌞 Light Mode" : m === 'dark' ? "🌙 Dark Mode" : "🖥 System Default"}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}  

            {currentSection === "about" && (
              <View>
                <ThemedText style={{ color: colors.text }}>Version: {Application.nativeApplicationVersion || "1.0.0"}</ThemedText>
                <ThemedText style={{ color: colors.text, marginVertical: 10 }}>This application showcases the beauty of Kosovo.</ThemedText>
                <TouchableOpacity onPress={() => { Clipboard.setStringAsync("intoKosovateam@gmail.com"); alert("Copied!"); }}>
                  <ThemedText style={{ color: colors.primary }}>📧 intoKosovateam@gmail.com</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {currentSection === "reset" && (
              <View style={styles.resetContainer}>
                <ThemedText style={styles.resetWarningText}>Are you sure? This cannot be undone!</ThemedText>
                <TouchableOpacity onPress={() => { handleResetProgress(); closeModal(); }} style={styles.deleteButton}>
                  <ThemedText style={styles.deleteButtonText}>Delete Progress</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.closeButtonBottom} onPress={closeModal}>
              <ThemedText style={{ color: colors.primary, fontSize: 16 }}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, alignItems: "center" },
  headerTitle: { fontSize: 32, fontWeight: "bold", marginBottom: 8 },
  headerSubtitle: { fontSize: 16, textAlign: "center" },
  content: { flex: 1, paddingHorizontal: 20 },
  optionCard: { width: "100%", marginBottom: 16, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center" },
  optionIcon: { marginRight: 16, padding: 8, borderRadius: 10 },
  optionTitle: { fontSize: 18, fontWeight: "500" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalBox: { padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 20 },
  themeOption: { paddingVertical: 14, paddingHorizontal: 10 },
  resetContainer: { alignItems: "center", marginTop: 20 },
  resetWarningText: { fontSize: 16, textAlign: "center", marginBottom: 30 },
  deleteButton: { backgroundColor: "#ff4444", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10 },
  deleteButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  closeButtonBottom: { marginTop: 30, alignSelf: "flex-end" },
});
