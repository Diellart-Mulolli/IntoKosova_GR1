import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@react-navigation/native";
import { useThemeManager } from "@/contexts/ThemeContext";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";


export default function CreateScreen() {
  const { colors } = useThemeManager();
  const theme = useTheme();
  const palette = theme.dark ? colors.dark : colors.light;

  const styles = createStyles(palette);

  const cameraRef = useRef<CameraView | null>(null);

const [permission, requestPermission] = useCameraPermissions();
const [isCameraOpen, setIsCameraOpen] = useState(false);
const [photoUri, setPhotoUri] = useState<string | null>(null);

const openCamera = async () => {
  if (!permission) {
    await requestPermission();
    setIsCameraOpen(true);
    return;
  }

  if (!permission.granted) {
    const res = await requestPermission();
    if (!res.granted) return;
  }

  setIsCameraOpen(true);
};

const takePhoto = async () => {
  if (!cameraRef.current) return;

  const photo = await cameraRef.current.takePictureAsync({
    quality: 0.8,
  });

  setPhotoUri(photo.uri);
  setIsCameraOpen(false);
};

if (isCameraOpen) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
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


  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: palette.background }}
      edges={["top"]}
    >
      <View style={styles.container}>
        <Animated.View
          entering={FadeInUp.springify()}
          style={styles.photoPlaceholder}
        >
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={[styles.textButton, { marginTop: "40%" }]}
          >
            <Pressable onPress={() => console.log("Text button pressed")}>
              <IconSymbol size={24} name="text" color={palette.primary} />
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={[styles.cameraButton, { marginTop: 10 }]}
          >
           <Pressable onPress={openCamera}>
              <IconSymbol size={36} name="camera" color={palette.primary} />
          </Pressable>
          </Animated.View>
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={[styles.cameraButton, { marginTop: 10 }]}
          >
            <Pressable onPress={() => console.log("Plus button pressed")}>
              <IconSymbol size={48} name="plus" color={palette.primary} />
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (palette: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    photoPlaceholder: {
      width: "100%",
      height: "90%",
      backgroundColor: palette.card,
      borderWidth: 2,
      borderColor: palette.primary,
      borderRadius: 8,
      marginVertical: 20,
      marginTop: 0,
      marginBottom: 40,
      position: "relative",
      alignItems: "center",
    },
    textButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: palette.card,
      borderWidth: 2,
      borderColor: palette.primary,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: "auto",
      marginRight: 5,
    },
    cameraButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: palette.card,
      borderWidth: 2,
      borderColor: palette.primary,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: "auto",
      marginRight: 5,
    },
  });
