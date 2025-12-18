import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Pressable, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";


export default function CameraScreen() {
  const params = useLocalSearchParams();
  const from = params.from; // "create"
  const fullscreen = params.fullscreen === "true";

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");
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
    router.back(); // ose router.replace me param
  };

  const flipCamera = () => {
  setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

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

});
