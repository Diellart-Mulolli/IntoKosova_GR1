// app/(tabs)/profile.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/styles/commonStyles";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "../../firebase/firebase";

const profileOptions = [
  {
    id: 1,
    title: "My Favorites",
    description: "Places you've saved for later",
    icon: "heart.fill",
    color: colors.primary,
  },
  {
    id: 2,
    title: "Travel History",
    description: "Your Kosovo exploration journey",
    icon: "map.fill",
    color: "#FF6B6B",
  },
  {
    id: 3,
    title: "Language Settings",
    description: "Albanian, English",
    icon: "globe",
    color: colors.secondary,
  },
  {
    id: 4,
    title: "Offline Maps",
    description: "Download maps for offline use",
    icon: "arrow.down.circle.fill",
    color: "#FF8C00",
  },
  {
    id: 5,
    title: "Share App",
    description: "Tell friends about intoKosova",
    icon: "square.and.arrow.up.fill",
    color: "#FF6B6B",
  },
  {
    id: 6,
    title: "Support",
    description: "Get help and contact us",
    icon: "questionmark.circle.fill",
    color: "#4ECDC4",
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 4px 16px rgba(49, 130, 206, 0.15)",
      },
    }),
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 8,
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 4px 16px rgba(49, 130, 206, 0.15)",
      },
    }),
  },
  optionsContainer: {
    paddingBottom: 100,
  },
  optionCard: {
    width: "100%",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 6px 20px rgba(49, 130, 206, 0.15)",
      },
    }),
  },
  optionContent: {
    padding: 20,
    backgroundColor: "#fff",
    minHeight: 100,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  optionIcon: {
    marginRight: 16,
    padding: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.secondary,
    lineHeight: 20,
  },
  // Auth form styles
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },
  authCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
    }),
  },
  authTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: colors.text,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  switchBtn: {
    marginTop: 16,
    alignItems: "center",
  },
  switchText: {
    color: colors.primary,
    fontWeight: "600",
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 8,
    textAlign: "center",
  },
});

// Simple reusable auth form
const AuthForm = React.memo(
  ({
    isSignUp,
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    authLoading,
    errorMessage,
    onSubmit,
    toggleMode,
  }: {
    isSignUp: boolean;
    fullName: string;
    setFullName: (v: string) => void;
    email: string;
    setEmail: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    authLoading: boolean;
    errorMessage: string;
    onSubmit: () => void;
    toggleMode: () => void;
  }) => {
    return (
      <Animated.View
        entering={FadeInUp.springify().damping(14)}
        style={styles.authCard}
      >
        <Text style={styles.authTitle}>
          {isSignUp ? "Create your account" : "Welcome back"}
        </Text>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {isSignUp && (
          <TextInput
            placeholder="Full name"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />
        )}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={[styles.btn, authLoading && styles.btnDisabled]}
          onPress={onSubmit}
          disabled={authLoading}
        >
          {authLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>
              {isSignUp ? "Sign Up" : "Log In"}
            </Text>
          )}
        </Pressable>

        <Pressable style={styles.switchBtn} onPress={toggleMode}>
          <Text style={styles.switchText}>
            {isSignUp
              ? "Already have an account? Log In"
              : "No account? Sign Up"}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }
);

export default function ProfileScreen() {
  // Auth state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Derived display values
  const displayName = useMemo(
    () => firebaseUser?.displayName || fullName || "Kosovo Explorer",
    [firebaseUser?.displayName, fullName]
  );
  const displayEmail = useMemo(
    () => firebaseUser?.email || email || "explorer@intokosova.com",
    [firebaseUser?.email, email]
  );

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsLoggedIn(!!user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleAuth = async () => {
    setErrorMessage("");
    if (!email || !password || (isSignUp && !fullName)) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    setAuthLoading(true);
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Optionally update profile displayName here if needed
        setFirebaseUser(cred.user);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        setFirebaseUser(cred.user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <AuthForm
          isSignUp={isSignUp}
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          authLoading={authLoading}
          errorMessage={errorMessage}
          onSubmit={handleAuth}
          toggleMode={() => {
            setIsSignUp((prev) => !prev);
            setErrorMessage("");
          }}
        />
      </SafeAreaView>
    );
  }
  const renderProfileOption = (
    option: (typeof profileOptions)[0],
    index: number
  ) => {
    return (
      <Animated.View
        key={option.id}
        entering={FadeInUp.delay(index * 100).springify()}
      >
        <Pressable
          style={styles.optionCard}
          onPress={() => console.log(`Option pressed: ${option.title}`)}
          android_ripple={{ color: "#E3F2FD" }}
        >
          <View
            style={[styles.optionContent, { borderLeftColor: option.color }]}
          >
            <View style={styles.optionHeader}>
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: `${option.color}20` },
                ]}
              >
                <IconSymbol
                  name={option.icon as any}
                  size={28}
                  color={option.color}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <View style={styles.profileImage}>
          <IconSymbol name="person.fill" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileEmail}>{displayEmail}</Text>
        <View style={styles.profileStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Places Visited</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          style={styles.statsContainer}
        >
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>
              Places{"\n"}Visited
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>
              Saved{"\n"}Favorites
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>
              Photos{"\n"}Taken
            </Text>
          </View>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {profileOptions.map((option, index) =>
            renderProfileOption(option, index)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
