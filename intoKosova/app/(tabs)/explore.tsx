import React from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useThemeManager } from "@/contexts/ThemeContext";
import CategoryCard from "@/components/category-card";

// ----------------------------------------------------------------------
// CATEGORY LIST (pa ndryshime!)
// ----------------------------------------------------------------------
export const explorationCategories = [
  {
    id: 1,
    title: "Historical Sites",
    description: "Discover Kosovo's rich historical heritage",
    icon: "building.columns.fill",
    colorKey: "primary",
    items: [
      {
        name: "Graçanica Monastery",
        image: require("@/assets/images/gracanica.jpg"),
      },
      { name: "Deçan Monastery", image: require("@/assets/images/decan.jpg") },
      {
        name: "Patriarchate of Peja",
        image: require("@/assets/images/peja.jpg"),
      },
    ],
  },
  {
    id: 2,
    title: "Natural Wonders",
    description: "Explore breathtaking landscapes and nature",
    icon: "mountain.2.fill",
    colorKey: "accent",
    items: [
      { name: "Rugova Canyon", image: require("@/assets/images/rugova.jpg") },
      {
        name: "Mirusha Waterfalls",
        image: require("@/assets/images/mirusha.jpg"),
      },
      { name: "Sharr Mountains", image: require("@/assets/images/sharr.jpg") },
    ],
  },
  {
    id: 3,
    title: "Cultural Heritage",
    description: "Experience traditional Kosovo culture",
    icon: "theatermasks.fill",
    colorKey: "secondary",
    items: [
      {
        name: "Traditional Crafts",
        image: require("@/assets/images/crafts.jpg"),
      },
      { name: "Folk Music", image: require("@/assets/images/music.jpg") },
      {
        name: "Local Festivals",
        image: require("@/assets/images/festival.jpg"),
      },
    ],
  },
  {
    id: 4,
    title: "Modern Kosovo",
    description: "Contemporary life and urban experiences",
    icon: "building.2.fill",
    colorKey: "highlight",
    items: [
      {
        name: "Pristina City Center",
        image: require("@/assets/images/city.jpg"),
      },
      {
        name: "Modern Architecture",
        image: require("@/assets/images/architecture.jpg"),
      },
      { name: "Nightlife", image: require("@/assets/images/nightlife.jpg") },
    ],
  },
  {
    id: 5,
    title: "Culinary Journey",
    description: "Taste authentic Kosovo cuisine",
    icon: "fork.knife",
    colorKey: "danger",
    items: [
      { name: "Flija", image: require("@/assets/images/flija.jpg") },
      { name: "Burek", image: require("@/assets/images/burek.jpg") },
      {
        name: "Traditional Restaurants",
        image: require("@/assets/images/restaurant.jpg"),
      },
    ],
  },
  {
    id: 6,
    title: "Adventure Sports",
    description: "Outdoor activities and adventures",
    icon: "figure.hiking",
    colorKey: "teal",
    items: [
      {
        name: "Hiking Trails",
        image: require("@/assets/images/hiking.jpg"),
      },
      {
        name: "Rock Climbing",
        image: require("@/assets/images/climbing.jpg"),
      },
      {
        name: "Winter Sports",
        image: require("@/assets/images/winter_sports.jpg"),
      },
    ],
  },
];

// ----------------------------------------------------------------------
//  CREATE STYLES — identik si HomeScreen
// ----------------------------------------------------------------------
const createStyles = (palette: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },

    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
      alignItems: "center",
    },

    headerTitle: {
      fontSize: 32,
      fontWeight: "bold",
      color: palette.text,
      marginBottom: 8,
      textAlign: "center",
    },

    headerSubtitle: {
      fontSize: 16,
      color: palette.textSecondary,
      textAlign: "center",
      lineHeight: 22,
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
        web: { boxShadow: "0 4px 16px rgba(0,0,0,0.15)" },
      }),
    },

    statItem: { alignItems: "center" },

    statNumber: {
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

    categoriesContainer: {
      paddingBottom: 100,
    },

    categoryCard: {
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
        web: { boxShadow: "0 6px 20px rgba(0,0,0,0.15)" },
      }),
    },

    categoryContent: {
      padding: 20,
      backgroundColor: palette.card,
      minHeight: 120,
      borderLeftWidth: 4,
    },

    categoryHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },

    categoryIcon: {
      marginRight: 16,
      padding: 12,
      borderRadius: 12,
    },

    categoryTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: palette.text,
      marginBottom: 4,
    },

    categoryDescription: {
      fontSize: 14,
      color: palette.textSecondary,
      lineHeight: 20,
    },

    categoryItems: {
      marginTop: 8,
      marginLeft: 8,
    },

    categoryItem: {
      fontSize: 12,
      color: palette.textSecondary,
      marginBottom: 2,
      opacity: 0.8,
    },
  });

// ----------------------------------------------------------------------
//   MAIN COMPONENT
// ----------------------------------------------------------------------
export default function ExplorationScreen() {
  const { colors } = useThemeManager();
  const theme = useTheme();
  const palette = theme.dark ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <Text style={styles.headerTitle}>Explore Kosovo</Text>
        <Text style={styles.headerSubtitle}>
          Discover the hidden gems and rich culture of Kosovo through various
          categories
        </Text>
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
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Historical{"\n"}Sites</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>25+</Text>
            <Text style={styles.statLabel}>Natural{"\n"}Wonders</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100+</Text>
            <Text style={styles.statLabel}>Cultural{"\n"}Experiences</Text>
          </View>
        </Animated.View>

        <View style={styles.categoriesContainer}>
         {explorationCategories.map((cat, index) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              index={index}
              styles={styles}
              palette={palette}
            />
          ))}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
