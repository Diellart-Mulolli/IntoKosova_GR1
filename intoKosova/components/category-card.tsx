import React from "react";
import { View, Text, Pressable, Platform } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";

function CategoryCard({ cat, index, styles, palette }) {
  const router = useRouter();
  const color = palette[cat.colorKey] ?? palette.primary;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
    >
      <Pressable
        style={styles.categoryCard}
        android_ripple={{ color: palette.lightBlue }}
        onPress={() =>
          router.push({
            pathname: "/(modals)/categoryDetails",
            params: { id: cat.id.toString() },
          })
        }
      >
        <View style={[styles.categoryContent, { borderLeftColor: color }]}>
          <View style={styles.categoryHeader}>
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: `${color}20` },
              ]}
            >
              <IconSymbol name={cat.icon} size={40} color={color} />
            </View>

            <View style={styles.categoryTextContainer}>
              <Text style={styles.categoryTitle}>{cat.title}</Text>

              <Text style={styles.categoryDescription}>
                {cat.description}
              </Text>

              <View style={styles.categoryItems}>
                {cat.items.slice(0, 2).map((item, i) => (
                  <Text key={i} style={styles.categoryItem}>
                    • {item.name}
                  </Text>
                ))}

                {cat.items.length > 2 && (
                  <Text style={styles.categoryItem}>
                    • +{cat.items.length - 2} more
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default React.memo(CategoryCard);
