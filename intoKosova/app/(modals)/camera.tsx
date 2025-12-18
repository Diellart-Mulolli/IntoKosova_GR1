import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Pressable, View, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";


export default function CameraScreen() {
  const params = useLocalSearchParams();
  const from = params.from; // "create"
  const fullscreen = params.fullscreen === "true";

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const router = useRouter();
  

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  if (!permission?.granted) {
    return null;
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    setPhotoUri(photo.uri);
  };

  const flipCamera = () => {
  setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  if (photoUri) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <Image
        source={{ uri: photoUri }}
        style={{ flex: 1 }}
        resizeMode="cover"
      />

      {/* Back */}
      <Pressable onPress={() => setPhotoUri(null)} style={styles.backButton}>
        <Ionicons name="close" size={28} color="white" />
      </Pressable>

      {/* Use photo */}
      <Pressable
        onPress={() =>
          router.replace({
            pathname: "/(tabs)/create",
            params: { photo: photoUri },
          })
        }
        style={styles.useButton}
      >
        <Ionicons name="checkmark" size={30} color="black" />
      </Pressable>
    </SafeAreaView>
  );
}

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </Pressable>

      <Pressable onPress={flipCamera} style={styles.flipButton}>
        <Ionicons name="camera-reverse" size={28} color="white" />
      </Pressable>


      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
      />


      <Pressable
        onPress={takePhoto}
        style={{
          position: "absolute",
          bottom: 40,
          alignSelf: "center",
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: "#fff",
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },

  flipButton: {
  position: "absolute",
  top: 50,
  right: 20,
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "rgba(0,0,0,0.6)",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
},

  useButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  }

});
