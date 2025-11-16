import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { colors } from "@/styles/commonStyles";
import { useThemeManager } from "@/contexts/ThemeContext";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth } from "../../firebase";
import { AntDesign } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { colorScheme } = useThemeManager();
  const theme = colors[colorScheme];
  const router = useRouter();

  /* ---------------- AUTH STATES ---------------- */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
const [phoneCode, setPhoneCode] = useState("");
const [confirmResult, setConfirmResult] = useState<any>(null);
const [usePhoneLogin, setUsePhoneLogin] = useState(false); 


  const generateCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const calculateAge = (day, month, year) => {
    const today = new Date();
    let age = today.getFullYear() - year;
    const m = today.getMonth() + 1 - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) age--;
    return age;
  };
 
// reCAPTCHA setup for phone auth (WEB)
const setUpRecaptcha = () => {
  if (typeof window === "undefined") return null;

  if (!(window as any).recaptchaVerifier) {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
      }
    );
  }
  return (window as any).recaptchaVerifier;
};

const handleSendPhoneCode = async () => {
  setErrorMessage("");

  if (!phoneNumber) {
    setErrorMessage("Please enter your phone number.");
    return;
  }

  try {
    const appVerifier = setUpRecaptcha();
    if (!appVerifier) {
      setErrorMessage(
        "reCAPTCHA is not available. Phone auth works only on web with this setup."
      );
      return;
    }

    // Shembull formati: +38344XXXXXX
    const confirmation = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    );
    setConfirmResult(confirmation);
    Alert.alert("Code sent", "We’ve sent an SMS code to your phone.");
  } catch (error: any) {
    console.log(error);
    setErrorMessage(error.message || "Failed to send verification code.");
  }
};

const handleConfirmPhoneCode = async () => {
  setErrorMessage("");

  if (!confirmResult || !phoneCode) {
    setErrorMessage("Please enter the code we sent to your phone.");
    return;
  }

  try {
    const result = await confirmResult.confirm(phoneCode);
    const user = result.user;

    setCurrentUser({
      fullName: user.displayName || "Phone User",
      emailOrPhone: user.phoneNumber,
    });

    setIsAuthenticated(true);
    router.replace("/(tabs)/homepage");
  } catch (error: any) {
    console.log(error);
    setErrorMessage("Invalid code. Please try again.");
  }
};



  /* ---------------- SIGNUP HANDLER ---------------- */
  const handleSignUp = async () => {
    setErrorMessage("");

    if (!emailOrPhone || !password || !fullName || !birthDate) {
      setErrorMessage("Please fill all fields to sign up.");
      return;
    }

    const regex = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;
    if (!regex.test(birthDate)) {
      setErrorMessage("Please enter a valid birth date (DD/MM/YYYY).");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        emailOrPhone,
        password
      );
      const user = userCredential.user;

      setCurrentUser({ fullName, emailOrPhone: user.email });
      setIsAuthenticated(true);
      Alert.alert("🎉 Account created!", `Welcome, ${fullName}!`);

      router.replace("/(tabs)/homepage");
      
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  /* ---------------- LOGIN HANDLER ---------------- */
  const handleSignIn = async () => {
    setErrorMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailOrPhone,
        password
      );

      const user = userCredential.user;

      setCurrentUser({
        fullName: user.displayName || "",
        emailOrPhone: user.email,
      });

      setIsAuthenticated(true);

      router.replace("/(tabs)/homepage");

    } catch (error) {
      setErrorMessage("Incorrect email or password");
    }
  };

  /* ---------------- GOOGLE LOGIN ---------------- */
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const newUser = {
        emailOrPhone: user.email,
        fullName: user.displayName || "Google User",
      };

      setCurrentUser(newUser);
      setIsAuthenticated(true);

      router.replace("/(tabs)/homepage");

    } catch (error) {
      setErrorMessage("Failed to sign in with Google.");
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

    /* ---------------- AUTH UI ---------------- */
  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[styles.authContainer, { backgroundColor: theme.background }]}
      >
        <Animated.View entering={FadeInUp.springify()}>
          {/* TITULLI – ndryshon në varësi a je në phone apo email */}
          <Text style={[styles.authTitle, { color: theme.text }]}>
            {usePhoneLogin
              ? "Sign in with phone"
              : isSignUp
              ? "Create your account"
              : "Welcome back"}
          </Text>

          {/* NËSE JEMI NË MODE PHONE LOGIN */}
          {usePhoneLogin ? (
            <>
              <TextInput
                placeholder="Phone number (e.g. +38344XXXXXX)"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#1A1A1A" : "#fff",
                    borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                    color: theme.text,
                  },
                ]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />

              {confirmResult && (
                <TextInput
                  placeholder="Verification code"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.input,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#1A1A1A" : "#fff",
                      borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                      color: theme.text,
                    },
                  ]}
                  value={phoneCode}
                  onChangeText={setPhoneCode}
                  keyboardType="number-pad"
                />
              )}
            </>
          ) : (
            /* NËSE JEMI NË MODE EMAIL/PASSWORD (SI MË PARË) */
            <>
              {isSignUp && (
                <>
                  <TextInput
                    placeholder="Full name"
                    placeholderTextColor={theme.textSecondary}
                    style={[
                      styles.input,
                      {
                        backgroundColor:
                          colorScheme === "dark" ? "#1A1A1A" : "#fff",
                        borderColor:
                          colorScheme === "dark" ? "#333" : "#ddd",
                        color: theme.text,
                      },
                    ]}
                    value={fullName}
                    onChangeText={setFullName}
                  />

                  <TextInput
                    placeholder="Birth Date (DD/MM/YYYY)"
                    placeholderTextColor={theme.textSecondary}
                    style={[
                      styles.input,
                      {
                        backgroundColor:
                          colorScheme === "dark" ? "#1A1A1A" : "#fff",
                        borderColor:
                          colorScheme === "dark" ? "#333" : "#ddd",
                        color: theme.text,
                      },
                    ]}
                    value={birthDate}
                    onChangeText={setBirthDate}
                  />
                </>
              )}

              <TextInput
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#1A1A1A" : "#fff",
                    borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                    color: theme.text,
                  },
                ]}
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#1A1A1A" : "#fff",
                    borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                    color: theme.text,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </>
          )}

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* BUTONI KRYESOR – sjellje ndryshe për phone vs email */}
          <Pressable
            style={[
              styles.button,
              {
                backgroundColor:
                  colorScheme === "dark" ? "#005FCC" : theme.primary,
              },
            ]}
            onPress={
              usePhoneLogin
                ? confirmResult
                  ? handleConfirmPhoneCode // pasi të jetë dërguar kodi
                  : handleSendPhoneCode // dërgon SMS-in
                : isSignUp
                ? handleSignUp
                : handleSignIn
            }
          >
            <Text style={styles.buttonText}>
              {usePhoneLogin
                ? confirmResult
                  ? "Confirm Code"
                  : "Send Code"
                : isSignUp
                ? "Sign Up"
                : "Sign In"}
            </Text>
          </Pressable>

          {/* TOGGLE mes email & phone */}
          <Pressable onPress={() => setUsePhoneLogin(!usePhoneLogin)}>
            <Text style={[styles.linkText, { color: theme.primary }]}>
              {usePhoneLogin
                ? "Use email & password instead"
                : "Use phone number instead"}
            </Text>
          </Pressable>

          {!isSignUp && (
            <Pressable
              style={[
                styles.googleBtn,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#111" : "#fff",
                  borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                },
              ]}
              onPress={handleGoogleLogin}
            >
              <AntDesign name="google" size={22} color="#DB4437" />
              <Text
                style={[
                  styles.googleText,
                  { color: theme.text, marginLeft: 8 },
                ]}
              >
                Continue with Google
              </Text>
            </Pressable>
          )}

          {/* Switch Sign In / Sign Up */}
          <Pressable onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={[styles.linkText, { color: theme.primary }]}>
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Text>
          </Pressable>
        </Animated.View>

        {/* reCAPTCHA container (WEB) */}
        <View id="recaptcha-container" />
      </SafeAreaView>
    );
  }



  /* ---------------- PROFILE UI ---------------- */
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <View style={[styles.profileImage, { backgroundColor: theme.primary }]}>
          <IconSymbol name="person.fill" size={40} color="#fff" />
        </View>

        <Text style={[styles.profileName, { color: theme.text }]}>
          {currentUser?.fullName}
        </Text>
        <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
          {currentUser?.emailOrPhone}
        </Text>
      </Animated.View>

      <ScrollView style={{ paddingHorizontal: 20 }}>
        <View
          style={[
            styles.statsContainer,
            {
              backgroundColor: colorScheme === "dark" ? "#111" : theme.card,
            },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Places Visited
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Favorites
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Photos
            </Text>
          </View>
        </View>

        <Pressable
          style={[
            styles.logoutButton,
            {
              backgroundColor: colorScheme === "dark" ? "#b91c1c" : "#FF6B6B",
            },
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  authTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    width: 300,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    fontSize: 16,
  },
  button: {
    width: 300,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  linkText: {
    marginTop: 16,
    textAlign: "center",
    fontWeight: "500",
    fontSize: 15,
  },
  errorText: {
    color: "#e63946",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 14,
  },
  header: { alignItems: "center", marginTop: 40 },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileName: { fontSize: 24, fontWeight: "700" },
  profileEmail: { fontSize: 15, marginBottom: 20 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 12, marginTop: 2 },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 12,
    width: 300,
    borderWidth: 1,
  },
  googleText: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 50,
  },
});
