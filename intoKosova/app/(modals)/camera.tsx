import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Pressable, View, StyleSheet, Image, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";


export default function CameraScreen() {
  const params = useLocalSearchParams();
  const from = params.from; // "create"
  const fullscreen = params.fullscreen === "true";

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [rotation, setRotation] = useState(0);
  const router = useRouter();
  
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const gesturesEnabled = Platform.OS !== "web" && isCropping;

 const panGesture = Gesture.Pan()
  .enabled(isCropping)
  .onUpdate((e) => {
    translateX.value = e.translationX;
    translateY.value = e.translationY;
  });

const pinchGesture = Gesture.Pinch()
  .enabled(isCropping)
  .onUpdate((e) => {
    scale.value = Math.max(1, e.scale);
  });


const combinedGesture = Gesture.Simultaneous(
  panGesture,
  pinchGesture
);

const imageStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: translateX.value },
    { translateY: translateY.value },
    { scale: scale.value },
  ],
}));


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

 const rotatePhoto = async () => {
  if (!photoUri) return;

  const result = await ImageManipulator.manipulateAsync(
    photoUri,
    [{ rotate: 90 }],
    {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  // RESET gestures pas rotate
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;

  setPhotoUri(result.uri);
};


const cropPhoto = async () => {
  if (!photoUri) return;

  const info = await ImageManipulator.manipulateAsync(
    photoUri,
    [],
    { base64: true }
  );

  const size = Math.min(info.width, info.height);

  const crop = {
    originX: (info.width - size) / 2,
    originY: (info.height - size) / 2,
    width: size,
    height: size,
  };

  const result = await ImageManipulator.manipulateAsync(
    photoUri,
    [{ crop }],
    {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  setPhotoUri(result.uri);
};

const applyCrop = async () => {
  if (!photoUri) return;

  const result = await ImageManipulator.manipulateAsync(
    photoUri,
    [
      {
        crop: {
          originX: 0,
          originY: 0,
          width: 1000,
          height: 1000,
        },
      },
    ],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
  );

  setPhotoUri(result.uri);
  setIsCropping(false);
};

// Compress image if it's larger than 1MB, return uri of compressed image
const compressIfNeeded = async (uri: string) => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    const maxBytes = 1_000_000; // 1MB
    const size = (info as any).size as number | undefined;
    if (size && size <= maxBytes) return uri;

    // Get image dimensions
    const meta = await ImageManipulator.manipulateAsync(uri, [], { base64: false });
    const origWidth = meta.width || 1000;

    let quality = 0.85;
    let attempt = 0;
    let lastUri = uri;

    while (attempt < 6) {
      const resizeWidth = Math.max(600, Math.round(origWidth * Math.pow(0.9, attempt)));
      const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: resizeWidth } }], { compress: quality, format: ImageManipulator.SaveFormat.JPEG });
      const newInfo = await FileSystem.getInfoAsync(result.uri);
      lastUri = result.uri;
      const newSize = (newInfo as any).size as number | undefined;
      if (newSize && newSize <= maxBytes) return result.uri;
      // Reduce quality and try again
      quality = Math.max(0.35, quality - 0.15);
      attempt++;
    }

    // Return last result even if still >1MB
    return lastUri;
  } catch (e) {
    console.warn("Image compression failed", e);
    return uri;
  }
};

// Use captured photo immediately in Profile Add Photo modal
const useCapturedPhoto = async () => {
  if (!photoUri) return;
  try {
    // Compress if needed
    const finalUri = await compressIfNeeded(photoUri);

    // Convert to base64 and send to profile so the modal can display it immediately
    const base64 = await FileSystem.readAsStringAsync(finalUri, {
      // Some SDK versions don't export EncodingType typings — use string literal to avoid TS errors
      encoding: 'base64' as any,
    });
    const data = `data:image/jpeg;base64,${base64}`;
    router.replace({ pathname: "/(tabs)/profile", params: { newPhotoBase64: data } });
  } catch (err) {
    // Fallback: send the URI if base64 conversion fails (e.g., web)
    console.warn("Could not convert photo to base64, sending uri instead", err);
    router.replace({ pathname: "/(tabs)/profile", params: { newPhotoBase64: photoUri } });
  }
};


  if (photoUri) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <Pressable
        onPress={() => router.replace("/(tabs)/create")}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </Pressable>

      {gesturesEnabled ? (
        <GestureDetector gesture={combinedGesture}>
          <Animated.Image
            source={{ uri: photoUri }}
            style={[styles.previewImage, imageStyle]}
            resizeMode="contain"
          />
        </GestureDetector>
      ) : (
        <Image
          source={{ uri: photoUri }}
          style={styles.previewImage}
          resizeMode="contain"
        />
      )}

      {Platform.OS === "web" && (
        <View style={styles.webHint}>
          <Text style={styles.webHintText}>
            Advanced photo editing is available on mobile devices
          </Text>
        </View>
      )}

      {/* TOP ACTIONS */}
      <View style={styles.topActions}>
        <Pressable onPress={() => setPhotoUri(null)}>
          <Ionicons name="refresh" size={28} color="white" />
        </Pressable>

        <Pressable onPress={rotatePhoto}>
          <Ionicons name="refresh-circle" size={30} color="white" />
        </Pressable>

        {Platform.OS !== "web" && (
          <Pressable onPress={() => setIsCropping((prev) => !prev)}>
            <Ionicons
              name="crop"
              size={26}
              color={isCropping ? "yellow" : "white"}
            />
          </Pressable>
        )}
      </View>

      {/* USE PHOTO */}
      <Pressable
        onPress={useCapturedPhoto}
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

     <View style={styles.webCameraWrapper}>
        <CameraView
          ref={cameraRef}
          facing={facing}
          style={styles.webCamera}
        />
      </View>

    {Platform.OS === "web" && (
    <View style={styles.webHint}>
      <Text style={{ color: "white", fontSize: 12 }}>
        Live preview may differ from final photo
      </Text>
    </View>
  )}

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
},

  topActions: {
  position: "absolute",
  top: 50,
  left: 80, // LË VEND për back
  right: 80, // LË VEND për flip
  flexDirection: "row",
  justifyContent: "space-around",
  zIndex: 100,
},

  previewImage: {
    width: "100%",
    height: "100%",
  },

  camera: {
    width: "100%",
    height: "100%",
    ...(Platform.OS === "web" && {
      aspectRatio: 3 / 4, // ose 9/16
      maxWidth: 420,
      alignSelf: "center",
      flex: 1,
    }),
  },

  webHint: {
  position: "absolute",
  bottom: 120,
  alignSelf: "center",
  backgroundColor: "rgba(0,0,0,0.6)",
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
  zIndex: 50,
},

webHintText: {
  color: "#fff",
  fontSize: 13,
  textAlign: "center",
},


webCameraWrapper: {
  flex: 1,
  backgroundColor: "black",
  justifyContent: "center",
  alignItems: "center",
},

webCamera: {
  width: "100%",
  aspectRatio: 3 / 4,
},


});
