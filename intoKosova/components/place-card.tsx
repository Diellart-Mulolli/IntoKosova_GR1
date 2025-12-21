import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  place: string;
  city: string;
  description?: string;
  imageUri: any; // mundet me qenë uri string ose require(...)
  borderColor?: string;
  iconName?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  palette: any;
};

function PlaceCardBase({
  place,
  city,
  description,
  imageUri,
  borderColor = "transparent",
  iconName,
  onPress,
  onLongPress,
  palette,
}: Props) {
  const styles = React.useMemo(() => createStyles(palette), [palette]);

  return (
    <Pressable
      style={[styles.card, { borderColor }]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* Nëse është require(...) ose {uri:...} */}
      <Image
        source={typeof imageUri === "string" ? { uri: imageUri } : imageUri}
        style={styles.cardImg}
      />
      <View style={styles.cardContent}>
        <Text style={styles.place} numberOfLines={1}>
          {place}
        </Text>
        <Text style={styles.city} numberOfLines={1}>
          {city}
        </Text>

        {!!description && (
          <Text style={styles.desc} numberOfLines={2}>
            {description}
          </Text>
        )}

        {!!iconName && (
          <View style={[styles.badge, { backgroundColor: borderColor }]}>
            <MaterialCommunityIcons
              name={iconName as any}
              size={14}
              color="#fff"
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}

// Comparator për React.memo (që mos me re-renderu pa nevojë)
function areEqual(prev: Props, next: Props) {
  const prevImg =
    typeof prev.imageUri === "string"
      ? prev.imageUri
      : JSON.stringify(prev.imageUri);

  const nextImg =
    typeof next.imageUri === "string"
      ? next.imageUri
      : JSON.stringify(next.imageUri);

  return (
    prev.place === next.place &&
    prev.city === next.city &&
    prev.description === next.description &&
    prevImg === nextImg &&
    prev.borderColor === next.borderColor &&
    prev.iconName === next.iconName &&
    // krahaso vetëm fushat kryesore të palette që ndikojnë në UI
    prev.palette?.card === next.palette?.card &&
    prev.palette?.text === next.palette?.text &&
    prev.palette?.textSecondary === next.palette?.textSecondary
  );
}

export default React.memo(PlaceCardBase, areEqual);

const createStyles = (palette: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: palette.card,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 2,
      elevation: 3,
    },
    cardImg: { width: "100%", height: 120 },
    cardContent: { padding: 10 },
    place: { fontWeight: "bold", fontSize: 14, color: palette.text },
    city: { fontSize: 12, color: palette.textSecondary },
    desc: { fontSize: 12, color: palette.textSecondary, marginVertical: 4 },
    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginTop: 4,
    },
  });

