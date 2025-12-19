import React, { useEffect, useState } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { colors, commonStyles } from "@/styles/commonStyles";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
  Image,
  RefreshControl,
} from "react-native";
import { GlassView } from "expo-glass-effect";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { FlatList } from "react-native";
import { useCallback, useMemo } from "react";

import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
// ------------------------------------
// FEATURE LIST
// ------------------------------------
const WEATHER_CACHE_KEY = "weather_cache";
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const fetchWithTimeout = (url: string, options: any = {}, timeout = 3000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), timeout)
    ),
  ]);
};

// Network check
import NetInfo from "@react-native-community/netinfo";

const weatherIcons: any = {
  "01d": require("@/assets/weather/sun.png"),
  "01n": require("@/assets/weather/sun.png"),

  "02d": require("@/assets/weather/partly.png"),
  "02n": require("@/assets/weather/partly.png"),

  "03d": require("@/assets/weather/cloudy.png"),
  "03n": require("@/assets/weather/cloudy.png"),

  "04d": require("@/assets/weather/cloudy.png"),
  "04n": require("@/assets/weather/cloudy.png"),

  "09d": require("@/assets/weather/rain.png"),
  "09n": require("@/assets/weather/rain.png"),

  "10d": require("@/assets/weather/rain.png"),
  "10n": require("@/assets/weather/rain.png"),

  "11d": require("@/assets/weather/rain.png"),
  "11n": require("@/assets/weather/rain.png"),

  "13d": require("@/assets/weather/snow.png"),
  "13n": require("@/assets/weather/snow.png"),

  "50d": require("@/assets/weather/fog.png"),
  "50n": require("@/assets/weather/fog.png"),
};

const weatherGradients: any = {
  Clear: ["#f6d365", "#fda085"], // Sunny orange/yellow
  Clouds: ["#bdc3c7", "#2c3e50"], // Grey/blue
  Rain: ["#4b79a1", "#283e51"], // Dark blue
  Drizzle: ["#4b79a1", "#283e51"], // Same as rain
  Thunderstorm: ["#232526", "#414345"], // Stormy
  Snow: ["#83a4d4", "#b6fbff"], // Ice blue
  Mist: ["#606c88", "#3f4c6b"],
  Fog: ["#606c88", "#3f4c6b"],
};

const errorMessages = {
  location: {
    icon: "📍",
    title: "Location Disabled",
    desc: "Enable location services to see local weather.",
  },
  network: {
    icon: "🌐",
    title: "No Internet Connection",
    desc: "Please check your network and try again.",
  },
  api: {
    icon: "🔑",
    title: "Weather Service Error",
    desc: "There was an issue fetching weather data.",
  },
  unknown: {
    icon: "❓",
    title: "Unexpected Error",
    desc: "Something went wrong.",
  },
};

const getWeatherGradient = (condition: string) => {
  return weatherGradients[condition] || ["#4e54c8", "#8f94fb"]; // default purple gradient
};

import { useThemeManager } from "../../contexts/ThemeContext";

const features = [
  {
    id: 1,
    title: "Discover Heritage",
    description:
      "Explore Kosovo's rich historical sites and cultural landmarks",
    icon: "building.columns.fill",
    colorKey: "primary",
  },
  {
    id: 2,
    title: "Natural Beauty",
    description: "Experience breathtaking landscapes and pristine nature",
    icon: "mountain.2.fill",
    colorKey: "accent",
  },
  {
    id: 3,
    title: "Local Culture",
    description: "Immerse yourself in authentic Kosovo traditions",
    icon: "theatermasks.fill",
    colorKey: "secondary",
  },
  {
    id: 4,
    title: "Modern Kosovo",
    description: "Discover contemporary life and urban experiences",
    icon: "building.2.fill",
    colorKey: "highlight",
  },
];

const stats = [
  { label: "UNESCO Sites", value: "4", icon: "star.fill" },
  { label: "National Parks", value: "2", icon: "mountain.2.fill" },
  { label: "Museums", value: "15+", icon: "building.fill" },
];

// ------------------------------------
// STYLES (DYNAMIC VIA palette)
// ------------------------------------
const createStyles = (palette: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },

    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
      alignItems: "center",
    },

    titleText: {
      fontSize: 32,
      fontWeight: "bold",
      color: palette.text,
      marginBottom: 8,
      textAlign: "center",
    },

    subtitleText: {
      fontSize: 16,
      color: palette.textSecondary,
      lineHeight: 22,
      textAlign: "center",
    },

    content: { flex: 1, paddingHorizontal: 20 },

    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 24,
      paddingVertical: 16,
      backgroundColor: palette.card,
      borderRadius: 16,
      ...Platform.select({
        ios: {
          shadowColor: palette.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: { elevation: 4 },
        web: { boxShadow: "0 4px 16px rgba(49,130,206,0.15)" },
      }),
    },

    statItem: { alignItems: "center" },
    statIcon: { marginBottom: 8 },

    statValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: palette.primary,
      marginBottom: 4,
    },

    statLabel: {
      fontSize: 12,
      color: palette.textSecondary,
      textAlign: "center",
    },

    featuresContainer: { paddingBottom: 100 },

    featureCard: {
      width: "100%",
      marginBottom: 16,
      borderRadius: 16,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: palette.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: { elevation: 6 },
        web: { boxShadow: "0 6px 20px rgba(49,130,206,0.15)" },
      }),
    },

    featureContent: {
      padding: 20,
      backgroundColor: palette.card,
      minHeight: 120,
      borderLeftWidth: 4,
    },

    featureHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },

    featureIcon: {
      marginRight: 16,
      marginTop: 10,
      padding: 12,
      borderRadius: 12,
    },

    featureTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: palette.text,
      marginBottom: 4,
    },

    featureDescription: {
      fontSize: 14,
      color: palette.textSecondary,
      lineHeight: 20,
    },
  });

// ------------------------------------
// MAIN SCREEN
// ------------------------------------
export default function HomeScreen() {
  const { colors } = useThemeManager();
  const theme = useTheme();
  const palette = theme.dark ? colors.dark : colors.light;

  const styles = useMemo(() => createStyles(palette), [palette]);

  const [weather, setWeather] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherError, setWeatherError] = useState<
    null | "location" | "network" | "api" | "unknown"
  >(null);
  const [pullY, setPullY] = useState(0);
  const scrollY = useSharedValue(0);

  const spinValue = useSharedValue(0);
  const pulseValue = useSharedValue(1);

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${spinValue.value * 360}deg`,
        },
      ],
    };
  });

  // Pulsimi i rrethit të madh
  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: pulseValue.value,
        },
      ],
      opacity: pulseValue.value,
    };
  });

  const startPremiumSpinner = () => {
    // Rrotullim i pafund
    spinValue.value = withRepeat(withTiming(1, { duration: 900 }), -1, false);

    // Pulsim i butë
    pulseValue.value = withRepeat(withTiming(0.4, { duration: 700 }), -1, true);
  };

  const fetchWeather = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
        if (cached) {
          const cachedData = JSON.parse(cached);
          const now = Date.now();
          if (now - cachedData.timestamp < CACHE_DURATION) {
            setWeather(cachedData.weather);
            setWeatherError(null);
            return;
          }
        }
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setWeather(null);
        setWeatherError("location");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude: lat, longitude: lon } = loc.coords;

      const apiKey = "6068fce306e355cd321c53a65029295b";

      // Kontrollo rrjetin — vetem NJE HERË
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        setWeather(null);
        setWeatherError("network");
        return;
      }

      // Fetch me timeout
      let res;
      try {
        res = await fetchWithTimeout(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
          {},
          3000
        );
      } catch (err: any) {
        setWeather(null);
        setWeatherError(err.message === "timeout" ? "network" : "unknown");
        return;
      }

      if (!res.ok) {
        setWeather(null);
        setWeatherError("api");
        return;
      }

      const data = await res.json();

      const parsedWeather = {
        temp: Math.round(data.main.temp),
        city: data.name,
        desc: data.weather[0].description,
        icon: data.weather[0].icon,
        condition: data.weather[0].main,
      };

      await AsyncStorage.setItem(
        WEATHER_CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), weather: parsedWeather })
      );

      setWeather(parsedWeather);
      setWeatherError(null);
    } catch (e) {
      console.log("Weather unknown error:", e);
      setWeather(null);
      setWeatherError("unknown");
    }
  };

  const WeatherErrorCard = React.memo(
    //React.memo per optimization
    ({ palette, weatherError }: { palette: any; weatherError: any }) => {
      const messages: any = {
        location: {
          icon: "📍",
          title: "Location Disabled",
          desc: "Enable location services to get weather updates.",
        },
        network: {
          icon: "🌐",
          title: "No Internet",
          desc: "Please connect to the internet.",
        },
        api: {
          icon: "🔑",
          title: "API Error",
          desc: "Weather service configuration error.",
        },
        unknown: {
          icon: "❓",
          title: "Unknown Error",
          desc: "Something went wrong.",
        },
      };

      const msg = messages[weatherError ?? "unknown"];

      return (
        <Animated.View
          entering={FadeInUp.springify().duration(600)}
          style={{
            backgroundColor: palette.card,
            borderRadius: 14,
            padding: 18,
            marginBottom: 20,
            justifyContent: "center",
            alignItems: "center",
            ...Platform.select({
              ios: {
                shadowColor: palette.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
              },
              android: { elevation: 6 },
            }),
          }}
        >
          <Text style={{ fontSize: 42, marginBottom: 8 }}>{msg.icon}</Text>

          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: palette.text,
              marginBottom: 4,
            }}
          >
            {msg.title}
          </Text>

          <Text style={{ fontSize: 14, color: palette.textSecondary }}>
            {msg.desc}
          </Text>
        </Animated.View>
      );
    }
  );

  useEffect(() => {
    fetchWeather(false);
  }, []);

  const onRefresh = useCallback(async () => {
    //optimizimi i refresh
    setRefreshing(true);

    spinValue.value = 0;
    pulseValue.value = 1;
    startPremiumSpinner();

    await fetchWeather(true);

    setRefreshing(false);
  }, []);

  const renderFeatureItem = useCallback(
    //per optimizim
    ({ item, index }: { item: (typeof features)[0]; index: number }) => {
      const featureColor = palette[item.colorKey];

      return (
        <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
          <Pressable
            style={styles.featureCard}
            onPress={() => console.log(`Feature pressed: ${item.title}`)}
            android_ripple={{ color: palette.lightBlue }}
          >
            <View
              style={[styles.featureContent, { borderLeftColor: featureColor }]}
            >
              <View style={styles.featureHeader}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: featureColor + "33" },
                  ]}
                >
                  <IconSymbol name={item.icon} size={28} color={featureColor} />
                </View>

                <View>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      );
    },
    [palette, styles]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <Text style={styles.titleText}>intoKosova</Text>
        <Text style={styles.subtitleText}>
          Discover the heart of the Balkans through its rich history, stunning
          landscapes, and vibrant culture
        </Text>
      </Animated.View>

      <Animated.FlatList
        data={features}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFeatureItem}
        showsVerticalScrollIndicator={false}
        initialNumToRender={3}
        windowSize={5}
        removeClippedSubviews
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
        ListHeaderComponent={
          <>
            {/* WEATHER SUCCESS */}
            {weather && !weatherError && (
              <Animated.View entering={FadeInUp.delay(120).springify()}>
                <LinearGradient
                  colors={getWeatherGradient(weather.condition)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    ...Platform.select({
                      ios: {
                        shadowColor: palette.primary,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
                      },
                      android: { elevation: 6 },
                    }),
                  }}
                >
                  <View>
                    <Text
                      style={{ fontSize: 18, fontWeight: "600", color: "#fff" }}
                    >
                      {weather.city}
                    </Text>
                    <Text style={{ fontSize: 14, color: "#f0f0f0" }}>
                      {weather.desc}
                    </Text>
                  </View>

                  <View style={{ alignItems: "center" }}>
                    <Image
                      source={weatherIcons[weather.icon] || weatherIcons["01d"]}
                      style={{ width: 60, height: 60 }}
                      resizeMode="contain"
                    />

                    <Text
                      style={{ fontSize: 20, fontWeight: "700", color: "#fff" }}
                    >
                      {weather.temp}°C
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            )}

            {/* WEATHER ERROR */}
            {weatherError && (
              <WeatherErrorCard palette={palette} weatherError={weatherError} />
            )}

            {/* STATS */}
            <Animated.View
              entering={FadeInUp.delay(200).springify()}
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginBottom: 24,
                paddingVertical: 16,
                backgroundColor: palette.card,
                borderRadius: 16,
                ...Platform.select({
                  ios: {
                    shadowColor: palette.primary,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                  },
                  android: { elevation: 6 },
                }),
              }}
            >
              {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <IconSymbol
                      name={stat.icon}
                      size={20}
                      color={palette.primary}
                    />
                  </View>

                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </Animated.View>
          </>
        }
      />
    </SafeAreaView>
  );
}
