import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  activeScale?: number;
  pressDuration?: number;
};

export default function FadeTouchable({ children, onPress, style, activeOpacity = 0.7, activeScale = 0.98, pressDuration = 120 }: Props) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        opacity.value = withTiming(activeOpacity, { duration: pressDuration });
        scale.value = withTiming(activeScale, { duration: pressDuration });
      }}
      onPressOut={() => {
        opacity.value = withTiming(1, { duration: pressDuration });
        scale.value = withTiming(1, { duration: pressDuration });
      }}
      onPress={onPress}
    >
      <Animated.View style={[style as any, aStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
