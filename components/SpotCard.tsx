import { MapPin, Star } from "lucide-react-native";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { IconLabel, resolveTagIcon } from "@/components/ui/IconLabel";
import { Colors } from "@/constants/Colors";
import { Elevation, Radius, Spacing } from "@/constants/Theme";
import { Typography } from "@/constants/Typography";
import { Spot } from "@/types";

type SpotCardProps = {
  spot: Spot;
  onPress: () => void;
  onDelete: () => void;
};

const THUMB_SIZE = 76;

export const SpotCard = (props: SpotCardProps) => {
  const { spot, onPress, onDelete } = props;

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const tags = spot.tags ?? [];

  const coverUrl = [...(spot.spot_photos ?? [])].sort(
    (a, b) => a.position - b.position,
  )[0]?.url;

  const handleLongPress = () => {
    Alert.alert("Delete spot", `Remove "${spot.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface }, Elevation.card]}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.85}
    >
      <View style={[styles.thumb, { backgroundColor: theme.accent }]}>
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            style={styles.thumbImage}
            resizeMode="cover"
          />
        ) : (
          <MapPin size={26} color={theme.onAccent} strokeWidth={1.75} />
        )}
      </View>

      <View style={styles.body}>
        <Text
          style={[Typography.placeName, { color: theme.text }]}
          numberOfLines={1}
        >
          {spot.name}
        </Text>

        {tags.length > 0 ? (
          <View style={styles.iconRow}>
            {tags.map((tag) => (
              <IconLabel
                key={tag.id}
                icon={resolveTagIcon(tag)}
                label={tag.label}
              />
            ))}
          </View>
        ) : null}

        {spot.address ? (
          <Text
            style={[Typography.secondary, { color: theme.textMuted }]}
            numberOfLines={1}
          >
            {spot.address}
          </Text>
        ) : null}
      </View>

      {spot.is_favorite ? (
        <Star
          size={20}
          color={theme.ochre}
          fill={theme.ochre}
          strokeWidth={2}
          style={styles.favoriteStar}
        />
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.space3,
    marginHorizontal: Spacing.space4,
    padding: Spacing.space3,
    borderRadius: Radius.lg,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  body: {
    flex: 1,
    gap: Spacing.space2,
  },
  iconRow: {
    flexDirection: "row",
    gap: Spacing.space2,
  },
  favoriteStar: {
    alignSelf: "flex-start",
  },
});
