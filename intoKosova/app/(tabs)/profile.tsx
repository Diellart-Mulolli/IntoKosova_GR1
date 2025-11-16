// app/(tabs)/profile.tsx  (FULLY FIXED + AUTH + ANIMATIONS + 404 + ICONS + numColumns=2)
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
  User,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
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
  { key: "historical sites" as const, icon: "castle", color: "#8B4513", label: "Historical Sites" },
  { key: "natural wonders" as const, icon: "pine-tree", color: "#228B22", label: "Natural Wonders" },
  { key: "cultural heritage" as const, icon: "theater", color: "#9932CC", label: "Cultural Heritage" },
  { key: "modern kosovo" as const, icon: "city", color: "#1E90FF", label: "Modern Kosovo" },
  { key: "culinary journey" as const, icon: "silverware-fork-knife", color: "#FF6347", label: "Culinary Journey" },
  { key: "adventure sports" as const, icon: "hiking", color: "#FF8C00", label: "Adventure Sports" },
];

const createStyles = (palette: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 16, fontSize: 16, color: palette.textSecondary },
    authCard: { backgroundColor: palette.card, margin: 32, padding: 24, borderRadius: 16, elevation: 4 },
    authTitle: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
    input: {
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.inputBg,
      borderRadius: 8,
      padding: 14,
      marginBottom: 16,
      fontSize: 16,
    },
    btn: { backgroundColor: palette.primary, padding: 16, borderRadius: 8, alignItems: "center" },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    switchBtn: { marginTop: 16, alignItems: "center" },
    switchText: { color: palette.primary, fontWeight: "600" },
    logoutBtn: { position: "absolute", top: 16, right: 16, backgroundColor: "#ff4444", padding: 8, borderRadius: 8 },
    logoutText: { color: "#fff", fontWeight: "600" },
    scroll: { padding: 16 },
    header: { alignItems: "center", marginBottom: 24, paddingTop: 50 },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: palette.primary,
    },
    name: { fontSize: 24, fontWeight: "bold", marginTop: 8, color: palette.text },
    email: { fontSize: 16, color: palette.textSecondary },
    addBtn: { backgroundColor: palette.primary, padding: 14, borderRadius: 12, alignItems: "center", marginBottom: 20 },
    addText: { color: "#fff", fontWeight: "600" },
    row: { justifyContent: "space-between" },
    cardWrapper: { position: "relative", width: "48%", marginBottom: 16 },
    card: {
      backgroundColor: palette.card,
      borderRadius: 16,
      overflow: "hidden",
      elevation: 3,
      borderWidth: 2,
      borderColor: "transparent",
    },
    cardImg: { width: "100%", height: 120 },
    cardContent: { padding: 10 },
    place: { fontWeight: "bold", fontSize: 14, color: palette.text },
    city: { fontSize: 12, color: palette.textSecondary },
    desc: { fontSize: 12, color: palette.textSecondary, marginVertical: 4 },
    categoryBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginTop: 4,
    },
    removeBtn: {
      position: "absolute",
      top: "50%",
      right: 8,
      transform: [{ translateY: -16 }],
      backgroundColor: "rgba(255, 0, 0, 0.7)",
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
      borderColor: "#000",
      borderWidth: 2,
    },
    removeText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    empty: { textAlign: "center", color: palette.textSecondary, fontStyle: "italic", marginTop: 40 },
    instructions: {
      backgroundColor: palette.card,
      padding: 12,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: palette.border,
    },
    instructionsText: { color: palette.textSecondary, fontSize: 14, textAlign: "center" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
    modal: { backgroundColor: palette.card, width: "90%", borderRadius: 16, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, textAlign: "center", color: palette.text },
    label: { fontWeight: "600", marginBottom: 8, marginTop: 12, color: palette.text },
    catGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 16 },
    catCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      position: "relative",
    },
    catCircleSelected: { elevation: 8, shadowOpacity: 0.4 },
    selectedBorder: {
      position: "absolute",
      top: -4,
      left: -4,
      right: -4,
      bottom: -4,
      borderRadius: 36,
      borderWidth: 4,
      borderColor: palette.background,
    },
    status: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 12 },
    statusText: { marginLeft: 8, color: palette.textSecondary },
    successText: { color: "#4CAF50", fontWeight: "600" },
    modalBtns: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
    cancelBtn: { padding: 12, flex: 1, marginRight: 6, alignItems: "center", backgroundColor: palette.border, borderRadius: 8 },
    saveBtn: { backgroundColor: palette.primary, padding: 12, flex: 1, marginHorizontal: 3, borderRadius: 8, alignItems: "center" },
    addBtnStyle: { backgroundColor: "#4CAF50" },
    saveText: { color: "#fff", fontWeight: "600" },
  });

// === AUTH FORM (MEMOIZED + ANIMATED) ===
const AuthForm = React.memo(
  ({
    isSignUp,
    fullName,
    setFullName,
    birthDate,
    setBirthDate,
    emailOrPhone,
    setEmailOrPhone,
    password,
    setPassword,
    handleAuth,
    authLoading,
    palette,
    styles,
    toggleSignUp,
  }: any) => {
    return (
      <Animated.View entering={FadeInUp.springify().delay(100)}>
        <Text style={[styles.authTitle, { color: palette.text }]}>
          {isSignUp ? "Create your account" : "Welcome back"}
        </Text>

        {isSignUp && (
          <>
            <TextInput
              placeholder="Full name"
              placeholderTextColor={palette.textSecondary}
              style={[
                styles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.text,
                },
              ]}
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              placeholder="Birth Date (DD/MM/YYYY)"
              placeholderTextColor={palette.textSecondary}
              style={[
                styles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.text,
                },
              ]}
              value={birthDate}
              onChangeText={setBirthDate}
            />
          </>
        )}

        <TextInput
          placeholder="Email or phone number"
          placeholderTextColor={palette.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: palette.inputBg,
              borderColor: palette.border,
              color: palette.text,
            },
          ]}
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={palette.textSecondary + "80"}
          style={[
            styles.input,
            {
              backgroundColor: palette.inputBg,
              borderColor: palette.border,
              color: palette.text,
            },
          ]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={[styles.btn, authLoading && styles.btnDisabled]}
          onPress={handleAuth}
          disabled={authLoading}
        >
          {authLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>{isSignUp ? "Sign Up" : "Log In"}</Text>
          )}
        </Pressable>

        <Pressable style={styles.switchBtn} onPress={toggleSignUp}>
          <Text style={styles.switchText}>
            {isSignUp ? "Already have an account? Log In" : "No account? Sign Up"}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }
);

export default function ProfileScreen() {
  const { colors, isDark, setTheme } = useThemeManager();
  const palette = isDark ? colors.dark : colors.light;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auth form states
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [editModal, setEditModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [form, setForm] = useState({
    city: "Prishtina",
    place: "",
    description: "",
    category: "historical sites" as Photo["category"],
  });

  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success">("idle");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // === THEME SYNC ===
  useEffect(() => {
    const loadAndListenTheme = async () => {
      const saved = await AsyncStorage.getItem("theme");
      if (saved === "dark" || saved === "light") setTheme(saved);
    };
    loadAndListenTheme();

    const interval = setInterval(async () => {
      const current = await AsyncStorage.getItem("theme");
      if (current === "dark" && !isDark) setTheme("dark");
      if (current === "light" && isDark) setTheme("light");
    }, 1000);
    return () => clearInterval(interval);
  }, [isDark, setTheme]);

  // === AUTH LISTENER ===
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        await syncUserToFirestore(firebaseUser);
        await loadUserData(firebaseUser.uid);
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setPhotos([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getNextUserId = async (): Promise<string> => {
    const snapshot = await getDocs(collection(db, "users"));
    return `user_${String(snapshot.size + 1).padStart(3, "0")}`;
  };

  const createUserFolder = async (userId: string) => {
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}dataStorage/${userId}/photos`,
      { intermediates: true }
    ).catch(() => {});
  };

  const syncUserToFirestore = async (firebaseUser: User) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      const nextId = await getNextUserId();
      await createUserFolder(nextId);
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        userId: nextId,
        fullName: fullName || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
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
      const images = data.images || [];
      setPhotos(images);
      await AsyncStorage.setItem(`photos_${uid}`, JSON.stringify(images));
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

  const pickAndUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (result.canceled || !result.assets[0].uri) return;

    setUploadStatus("uploading");
    const uid = auth.currentUser!.uid;
    const userDoc = await getDoc(doc(db, "users", uid));
    const userId = userDoc.data()?.userId ?? uid;
    const photoId = uuidv4();
    const fileName = `${photoId}.jpg`;
    const localUri = `${FileSystem.documentDirectory}dataStorage/${userId}/photos/${fileName}`;
    const relativePath = `${BASE_PATH}/${userId}/photos/${fileName}`;

    try {
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}dataStorage/${userId}/photos`, {
        intermediates: true,
      });
      await FileSystem.copyAsync({ from: result.assets[0].uri, to: localUri });

      const newPhoto: Photo = {
        id: photoId,
        city: form.city,
        place: form.place,
        image: localUri,
        description: form.description,
        category: form.category,
      };

      const updated = [...photos, newPhoto];
      setPhotos(updated);
      await updateDoc(doc(db, "users", uid), {
        images: arrayUnion({ ...newPhoto, image: relativePath }),
        lastSeen: serverTimestamp(),
      });
      await AsyncStorage.setItem(`photos_${uid}`, JSON.stringify(updated));

      setUploadStatus("success");
      setUploadMessage("Uploaded!");
      setTimeout(() => {
        setUploadStatus("idle");
        setUploadMessage(null);
        setEditModal(false);
        setForm({ city: "Prishtina", place: "", description: "", category: "historical sites" });
      }, 1500);
    } catch (err: any) {
      Alert.alert("Upload Failed", err.message);
      setUploadStatus("idle");
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
      image: placeholderImg,
      description: form.description,
      category: form.category,
    };

    const updated = [...photos, newPhoto];
    setPhotos(updated);
    await updateDoc(doc(db, "users", uid), {
      images: arrayUnion({ ...newPhoto, image: relativePath }),
      lastSeen: serverTimestamp(),
    });
    await AsyncStorage.setItem(`photos_${uid}`, JSON.stringify(updated));
    setEditModal(false);
    setForm({ city: "Prishtina", place: "", description: "", category: "historical sites" });
  };

  const startEdit = (photo: Photo) => {
    setEditingPhoto(photo);
    setForm({
      city: photo.city,
      place: photo.place,
      description: photo.description,
      category: photo.category,
    });
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!editingPhoto) return;
    const uid = auth.currentUser!.uid;
    const updatedPhotos = photos.map((p) =>
      p.id === editingPhoto.id ? { ...p, ...form } : p
    );
    setPhotos(updatedPhotos);
    await setDoc(doc(db, "users", uid), { images: updatedPhotos }, { merge: true });
    await AsyncStorage.setItem(`photos_${uid}`, JSON.stringify(updatedPhotos));
    setEditModal(false);
    setEditingPhoto(null);
  };

  const deletePhoto = async (photo: Photo) => {
    Alert.alert("Delete", "Remove this photo?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const uid = auth.currentUser!.uid;
          const updated = photos.filter((p) => p.id !== photo.id);
          setPhotos(updated);
          await AsyncStorage.setItem(`photos_${uid}`, JSON.stringify(updated));

          if (photo.image.includes(FileSystem.documentDirectory)) {
            await FileSystem.deleteAsync(photo.image, { idempotent: true });
          }

          await updateDoc(doc(db, "users", uid), { images: arrayRemove(photo) });
        },
      },
    ]);
  };

  // === LOADING / AUTH SCREEN ===
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authCard}>
          <AuthForm
            key={isSignUp ? "signup" : "login"}
            isSignUp={isSignUp}
            fullName={fullName}
            setFullName={setFullName}
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            emailOrPhone={emailOrPhone}
            setEmailOrPhone={setEmailOrPhone}
            password={password}
            setPassword={setPassword}
            handleAuth={handleAuth}
            authLoading={authLoading}
            palette={palette}
            styles={styles}
            toggleSignUp={() => setIsSignUp(!isSignUp)}
          />
        </View>
      </SafeAreaView>
    );
  }

  // === PROFILE SCREEN ===
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
          <Image
            source={user?.photoURL ? { uri: user.photoURL } : profileFallback}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.email}>{user?.emailOrPhone}</Text>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Long press a card to edit • Tap X to delete
          </Text>
        </View>

        <Pressable style={styles.addBtn} onPress={() => setEditModal(true)}>
          <Text style={styles.addText}>+ Add Photo</Text>
        </Pressable>

        <FlatList
          data={photos}
          numColumns={2}
          columnWrapperStyle={styles.row}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const cat = categories.find((c) => c.key === item.category);
            const borderColor = cat?.color ?? "#ccc";

            return (
              <View style={styles.cardWrapper}>
                <Pressable
                  style={[styles.card, { borderColor }]}
                  onLongPress={() => startEdit(item)}
                >
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

                <Pressable style={styles.removeBtn} onPress={() => deletePhoto(item)}>
                  <Text style={styles.removeText}>X</Text>
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No photos yet. Tap + to add!</Text>}
        />
      </ScrollView>

      <Modal visible={editModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingPhoto ? "Edit Photo" : "Add New Photo"}
            </Text>

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
                    style={[
                      styles.catCircle,
                      { backgroundColor: cat.color },
                      isSelected && styles.catCircleSelected,
                    ]}
                    onPress={() => setForm({ ...form, category: cat.key })}
                  >
                    <MaterialCommunityIcons name={cat.icon} size={28} color="#fff" />
                    {isSelected && <View style={styles.selectedBorder} />}
                  </Pressable>
                );
              })}
            </View>

            {uploadStatus === "uploading" && (
              <View style={styles.status}>
                <ActivityIndicator size="small" color={palette.primary} />
                <Text style={styles.statusText}>Uploading...</Text>
              </View>
            )}
            {uploadMessage && (
              <View style={styles.status}>
                <Text style={styles.successText}>{uploadMessage}</Text>
              </View>
            )}

            <View style={styles.modalBtns}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => {
                  setEditModal(false);
                  setEditingPhoto(null);
                  setForm({ city: "Prishtina", place: "", description: "", category: "historical sites" });
                  setUploadStatus("idle");
                  setUploadMessage(null);
                }}
              >
                <Text style={{ color: palette.text }}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.saveBtn, styles.addBtnStyle]}
                onPress={editingPhoto ? saveEdit : addCardWithoutImage}
              >
                <Text style={styles.saveText}>Add</Text>
              </Pressable>

              <Pressable
                style={styles.saveBtn}
                onPress={editingPhoto ? saveEdit : pickAndUpload}
                disabled={uploadStatus === "uploading"}
              >
                <Text style={styles.saveText}>
                  {editingPhoto ? "Save" : uploadStatus === "uploading" ? "Uploading..." : "Pick & Upload"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}