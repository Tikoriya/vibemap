import { Map as MapIcon, MapPin } from "lucide-react-native";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import {
  ICON_LABELS,
  IconLabel,
  IconLabelKey,
} from "@/components/ui/IconLabel";
import { Colors } from "@/constants/Colors";
import { Elevation, Radius, Spacing } from "@/constants/Theme";
import { Typography } from "@/constants/Typography";
import { Spot, Tag } from "@/types";

type SpotCardProps = {
  spot: Spot;
  onPress: () => void;
  onDelete: () => void;
  onMapPress?: () => void;
};

const THUMB_SIZE = 76;

// Maps a tag onto a precreated icon-label preset by its label. Tags without a
// matching preset are skipped, so the row fills in as the registry grows.
const tagToPreset = (tag: Tag): IconLabelKey | null => {
  const key = tag.label.trim().toLowerCase();
  return key in ICON_LABELS ? (key as IconLabelKey) : null;
};

export const SpotCard = (props: SpotCardProps) => {
  const { spot, onPress, onDelete, onMapPress } = props;

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const tags = spot.tags ?? [];
  const presets = tags
    .map(tagToPreset)
    .filter((preset): preset is IconLabelKey => preset !== null);

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

        {presets.length > 0 ? (
          <View style={styles.iconRow}>
            {presets.map((preset, index) => (
              <IconLabel key={`${preset}-${index}`} preset={preset} />
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

      <TouchableOpacity
        onPress={onMapPress ?? onPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Show on map"
      >
        <MapIcon size={22} color={theme.text} strokeWidth={2} />
      </TouchableOpacity>
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
});
