// app/(tabs)/profile.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  User,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import placeholderImg from "../../dataStorage/user_001/photos/prishtina_boulevard_night.jpg";
import profileFallback from "../../dataStorage/user_001/profile.webp";
import { useThemeManager } from "../../contexts/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BASE_PATH = "/dataStorage";

interface Photo {
  id: string;
  city: string;
  place: string;
  image: string;
  description: string;
  category:
    | "historical sites"
    | "natural wonders"
    | "cultural heritage"
    | "modern kosovo"
    | "culinary journey"
    | "adventure sports";
}

interface UserData {
  uid: string;
  userId: string;
  fullName: string;
  emailOrPhone: string;
  birthDate: string;
  createdAt: string;
  lastSeen: string;
  photoURL: string | null;
  images: Photo[];
}

const categories = [
  { key: "historical sites", icon: "castle", color: "#8B4513" },
  { key: "natural wonders", icon: "pine-tree", color: "#228B22" },
  { key: "cultural heritage", icon: "theater", color: "#9932CC" },
  { key: "modern kosovo", icon: "city", color: "#1E90FF" },
  { key: "culinary journey", icon: "silverware-fork-knife", color: "#FF6347" },
  { key: "adventure sports", icon: "hiking", color: "#FF8C00" },
];

const createStyles = (palette: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 16, fontSize: 16, color: palette.textSecondary },
    authCard: {
      backgroundColor: palette.card,
      margin: 32,
      padding: 24,
      borderRadius: 16,
      elevation: 4,
    },
    authTitle: {
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 24,
    },
    input: {
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.inputBg,
      borderRadius: 8,
      padding: 14,
      marginBottom: 16,
      fontSize: 16,
      color: palette.text,
    },
    btn: { backgroundColor: palette.primary, padding: 16, borderRadius: 8, alignItems: "center" },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    switchBtn: { marginTop: 16, alignItems: "center" },
    switchText: { color: palette.primary, fontWeight: "600" },
    logoutBtn: {
      position: "absolute",
      top: 16,
      right: 16,
      backgroundColor: "#ff4444",
      padding: 8,
      borderRadius: 8,
    },
    logoutText: { color: "#fff", fontWeight: "600" },
    scroll: { padding: 16 },
    header: { alignItems: "center", marginBottom: 24, paddingTop: 50 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: palette.primary },
    name: { fontSize: 24, fontWeight: "bold", marginTop: 8, color: palette.text },
    email: { fontSize: 16, color: palette.textSecondary },
    addBtn: { backgroundColor: palette.primary, padding: 14, borderRadius: 12, alignItems: "center", marginBottom: 20 },
    addText: { color: "#fff", fontWeight: "600" },
    row: { justifyContent: "space-between" },
    cardWrapper: { position: "relative", width: "48%", marginBottom: 16 },
    card: { backgroundColor: palette.card, borderRadius: 16, overflow: "hidden", elevation: 3, borderWidth: 2, borderColor: "transparent" },
    cardImg: { width: "100%", height: 120 },
    cardContent: { padding: 10 },
    place: { fontWeight: "bold", fontSize: 14, color: palette.text },
    city: { fontSize: 12, color: palette.textSecondary },
    desc: { fontSize: 12, color: palette.textSecondary, marginVertical: 4 },
    categoryBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
    empty: { textAlign: "center", color: palette.textSecondary, fontStyle: "italic", marginTop: 40 },
    instructions: { backgroundColor: palette.card, padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: palette.border },
    instructionsText: { color: palette.textSecondary, fontSize: 14, textAlign: "center" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
    modal: { backgroundColor: palette.card, width: "90%", borderRadius: 16, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, textAlign: "center", color: palette.text },
    label: { fontWeight: "600", marginBottom: 8, marginTop: 12, color: palette.text },
    catGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 16 },
    catCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", marginBottom: 12, elevation: 6 },
    catCircleSelected: { elevation: 8 },
    selectedBorder: { position: "absolute", top: -4, left: -4, right: -4, bottom: -4, borderRadius: 36, borderWidth: 4, borderColor: palette.background },
    status: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 12 },
    statusText: { marginLeft: 8, color: palette.textSecondary },
    successText: { color: "#4CAF50", fontWeight: "600" },
    modalBtns: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    cancelBtn: { borderColor: "white" , borderWidth: 2 , padding: 12, flex: 1, marginRight: 6, alignItems: "center", backgroundColor: palette.border, borderRadius: 8 },
    saveBtn: { backgroundColor: palette.primary, padding: 12, flex: 1, marginHorizontal: 3, borderRadius: 8, alignItems: "center" , borderColor: "white" , borderWidth: 2},
    addBtnStyle: { backgroundColor: "#4CAF50" },
    saveText: { color: "#fff", fontWeight: "600", alignItems:"center",fontSize:30 },
    imagePickerBtn: { backgroundColor: palette.primary, padding: 12, borderRadius: 8, marginBottom: 12, alignItems: "center" },
    imagePickerText: { color: "#fff", fontWeight: "600" },
    previewImg: { width: "100%", height: 200, borderRadius: 12, marginBottom: 12 },
  });

// === AUTH FORM (MEMOIZED) ===
const AuthForm = React.memo((props: any) => {
  const { isSignUp, fullName, setFullName, birthDate, setBirthDate, emailOrPhone, setEmailOrPhone, password, setPassword, handleAuth, authLoading, palette, styles, toggleSignUp } = props;
  return (
    <Animated.View entering={FadeInUp.springify().delay(100)}>
      <Text style={[styles.authTitle, { color: palette.text }]}>{isSignUp ? "Create your account" : "Welcome back"}</Text>

      {isSignUp && (
        <>
          <TextInput placeholder="Full name" placeholderTextColor={palette.textSecondary} style={styles.input} value={fullName} onChangeText={setFullName} />
          <TextInput placeholder="Birth Date (DD/MM/YYYY)" placeholderTextColor={palette.textSecondary} style={styles.input} value={birthDate} onChangeText={setBirthDate} />
        </>
      )}

      <TextInput placeholder="Email or phone number" placeholderTextColor={palette.textSecondary} style={styles.input} value={emailOrPhone} onChangeText={setEmailOrPhone} keyboardType="email-address" autoCapitalize="none" />
      <TextInput placeholder="Password" placeholderTextColor={palette.textSecondary + "80"} style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

      <Pressable style={[styles.btn, authLoading && styles.btnDisabled]} onPress={handleAuth} disabled={authLoading}>
        {authLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{isSignUp ? "Sign Up" : "Log In"}</Text>}
      </Pressable>

      <Pressable style={styles.switchBtn} onPress={toggleSignUp}>
        <Text style={styles.switchText}>{isSignUp ? "Already have an account? Log In" : "No account? Sign Up"}</Text>
      </Pressable>
    </Animated.View>
  );
});

// === PROFILE SCREEN ===
export default function ProfileScreen() {
  const { colors, isDark, setTheme } = useThemeManager();
  const palette = isDark ? colors.dark : colors.light;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
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
  const [authLoading, setAuthLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [hiddenCards, setHiddenCards] = useState<string[]>([]);
  const [editModal, setEditModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [form, setForm] = useState({
    city: "Prishtina",
    place: "",
    description: "",
    category: "historical sites",
    image: "",
  });
    const colorScheme = isDark ? "dark" : "light";
    useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      setIsLoggedIn(true);
      await loadUserData(firebaseUser.uid);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }

    setLoading(false);
  });

  return unsubscribe;
}, []);


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

  // === FUNCTIONS ===
  const syncUserToFirestore = async (firebaseUser: User) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      const nextId = `user_${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}dataStorage/${nextId}/photos`, { intermediates: true });
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        userId: nextId,
        fullName: fullName || firebaseUser.displayName || "User",
        emailOrPhone: emailOrPhone || firebaseUser.email || "",
        birthDate: birthDate || "",
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        photoURL: profileFallback,
        images: [],
      });
    } else {
      await updateDoc(userRef, { lastSeen: serverTimestamp() });
    }
  };

  const loadUserData = async (uid: string) => {
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      const data = docSnap.data() as UserData;
      setUser(data);
      setPhotos(data.images || []);
      await AsyncStorage.setItem(`photos_${uid}`, JSON.stringify(data.images || []));
    }
  };

  const handleAuth = async () => {
    if (!emailOrPhone || !password || (isSignUp && (!fullName || !birthDate))) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setAuthLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, emailOrPhone, password);
        Alert.alert("Success", `Welcome, ${fullName}!`);
      } else {
        await signInWithEmailAndPassword(auth, emailOrPhone, password);
      }
    } catch (err: any) {
      Alert.alert("Auth Failed", err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Hide a card instead of deleting
  const hideCard = (photo: Photo) => {
    setHiddenCards((prev) => [...prev, photo.id]);
    setEditModal(false);
    setEditingPhoto(null);
  };

  const startEdit = (photo: Photo) => {
    setEditingPhoto(photo);
    setForm({
      city: photo.city,
      place: photo.place,
      description: photo.description,
      category: photo.category,
      image: photo.image,
    });
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!editingPhoto) return;
    const uid = auth.currentUser!.uid;
    const updatedPhotos = photos.map((p) => (p.id === editingPhoto.id ? { ...p, ...form } : p));
    setPhotos(updatedPhotos);
    await setDoc(doc(db, "users", uid), { images: updatedPhotos }, { merge: true });
    await AsyncStorage.setItem(`photos_${uid}`, JSON.stringify(updatedPhotos));
    setEditModal(false);
    setEditingPhoto(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0].uri) {
      setForm({ ...form, image: result.assets[0].uri });
    }
  };

  const addCardWithoutImage = async () => {
    if (!form.place || !form.city) {
      Alert.alert("Error", "Fill City and Place");
      return;
    }
    const uid = auth.currentUser!.uid;
    const userDoc = await getDoc(doc(db, "users", uid));
    const userId = userDoc.data()?.userId ?? uid;
    const photoId = uuidv4();
    const relativePath = `${BASE_PATH}/${userId}/photos/${photoId}.jpg`;

    const newPhoto: Photo = {
      id: photoId,
      city: form.city,
      place: form.place,
      image: form.image || placeholderImg,
      description: form.description,
      category: form.category,
    };
    const updated = [...photos, newPhoto];
    setPhotos(updated);
    await updateDoc(doc(db, "users", uid), { images: updated, lastSeen: serverTimestamp() });
    await AsyncStorage.setItem(`photos_${uid}`, JSON.stringify(updated));
    setEditModal(false);
    setForm({ city: "Prishtina", place: "", description: "", category: "historical sites", image: "" });
  };

  const visiblePhotos = photos.filter((p) => !hiddenCards.includes(p.id));

  // === RENDER ===
  if (loading) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </SafeAreaView>
  );

  if (!isLoggedIn) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.authCard}>
        <AuthForm key={isSignUp ? "signup" : "login"} isSignUp={isSignUp} fullName={fullName} setFullName={setFullName} birthDate={birthDate} setBirthDate={setBirthDate} emailOrPhone={emailOrPhone} setEmailOrPhone={setEmailOrPhone} password={password} setPassword={setPassword} handleAuth={handleAuth} authLoading={authLoading} palette={palette} styles={styles} toggleSignUp={() => setIsSignUp(!isSignUp)} />
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable style={styles.logoutBtn} onPress={handleLogout}><Text style={styles.logoutText}>Logout</Text></Pressable>
          <Image source={user?.photoURL ? { uri: user.photoURL } : profileFallback} style={styles.avatar} />
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.email}>{user?.emailOrPhone}</Text>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>Long press a card to edit and to delete as well</Text>
        </View>

        <Pressable style={styles.addBtn} onPress={() => setEditModal(true)}><Text style={styles.addText}>+ Add Photo</Text></Pressable>

        <FlatList
          data={visiblePhotos}
          numColumns={2}
          columnWrapperStyle={styles.row}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const cat = categories.find((c) => c.key === item.category);
            const borderColor = cat?.color ?? "#ccc";
            return (
              <View style={styles.cardWrapper}>
                <Pressable style={[styles.card, { borderColor }]} onLongPress={() => startEdit(item)}>
                  <Image source={{ uri: item.image }} style={styles.cardImg} defaultSource={placeholderImg} />
                  <View style={styles.cardContent}>
                    <Text style={styles.place}>{item.place}</Text>
                    <Text style={styles.city}>{item.city}</Text>
                    <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: borderColor }]}>
                      <MaterialCommunityIcons name={cat?.icon as any} size={14} color="#fff" />
                    </View>
                  </View>
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No photos yet. Tap + to add!</Text>}
        />
      </ScrollView>

      <Modal visible={editModal} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={[styles.modal, { maxHeight: "90%" }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.modalTitle}>{editingPhoto ? "Edit Photo" : "Add New Photo"}</Text>

        <Text style={styles.label}>Image</Text>
        {form.image ? (
          <Image source={{ uri: form.image }} style={styles.previewImg} />
        ) : (
          <Image source={placeholderImg} style={styles.previewImg} />
        )}
        <Pressable style={styles.imagePickerBtn} onPress={pickImage}>
          <Text style={styles.imagePickerText}>Pick Image</Text>
        </Pressable>

        <Text style={styles.label}>Municipality</Text>
        <TextInput
          placeholder="e.g. Prishtina"
          placeholderTextColor={palette.textSecondary + "80"}
          style={styles.input}
          value={form.city}
          onChangeText={(t) => setForm({ ...form, city: t })}
        />
        <Text style={styles.label}>Place</Text>
        <TextInput
          placeholder="e.g. Germia Park"
          placeholderTextColor={palette.textSecondary + "80"}
          style={styles.input}
          value={form.place}
          onChangeText={(t) => setForm({ ...form, place: t })}
        />
        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Tell us about this place..."
          placeholderTextColor={palette.textSecondary + "80"}
          style={[styles.input, { height: 80 }]}
          value={form.description}
          onChangeText={(t) => setForm({ ...form, description: t })}
          multiline
        />
        <Text style={styles.label}>Category</Text>
        <View style={styles.catGrid}>
          {categories.map((cat) => {
            const isSelected = form.category === cat.key;
            return (
              <Pressable
                key={cat.key}
                style={[styles.catCircle, { backgroundColor: cat.color }, isSelected && styles.catCircleSelected]}
                onPress={() => setForm({ ...form, category: cat.key })}
              >
                <MaterialCommunityIcons name={cat.icon} size={28} color="#fff" />
                {isSelected && <View style={styles.selectedBorder} />}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.modalBtns}>
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

          {editingPhoto && (
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
          </View>
              </ScrollView>

      {/* reCAPTCHA container (WEB) */}
      <View id="recaptcha-container" />
    </View>
  </View>
</Modal>
  </SafeAreaView>
  );
}
