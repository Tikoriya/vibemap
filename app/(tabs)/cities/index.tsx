import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Map, MapPin } from "lucide-react-native";

import { IconButton } from "@/components/ui/IconButton";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { Colors, Palette, ThemeColors } from "@/constants/Colors";
import { Elevation, Radius } from "@/constants/Theme";
import { FontFamily, Typography } from "@/constants/Typography";
import { useCities } from "@/hooks/useCities";
import { CityWithCount } from "@/types";

const GAP = 12;
const PADDING = 16;
const CARD_WIDTH = (Dimensions.get("window").width - PADDING * 2 - GAP) / 2;
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * 0.82);
const CARD_HEIGHT = IMAGE_HEIGHT + 64;

// Forest-derived placeholder gradients, in keeping with the design's map surface.
const CITY_GRADIENTS: [string, string][] = [
  ["#2B3D34", "#3C4F44"],
  ["#3A4F44", "#6F8378"],
  ["#1C2A23", "#3A4F44"],
  ["#33453B", "#3C4F44"],
  ["#2B3D34", "#6F8378"],
  ["#14201A", "#2B3D34"],
];

function gradientForName(name: string): [string, string] {
  if (!name) return CITY_GRADIENTS[0];
  return CITY_GRADIENTS[name.charCodeAt(0) % CITY_GRADIENTS.length];
}

// ── City Card ──────────────────────────────────────────────────────────────

type CityCardProps = {
  city: CityWithCount;
  theme: ThemeColors;
  onPress: () => void;
};

const CityCard = (props: CityCardProps) => {
  const { city, theme, onPress } = props;
  const gradient = gradientForName(city.name);

  const placesLabel = `${city.spotCount} ${city.spotCount === 1 ? "place" : "places"}`;
  const meta = city.country ? `${city.country} · ${placesLabel}` : placesLabel;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface }, Elevation.card]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.cardImage}>
        {city.imageUrl ? (
          <Image
            source={{ uri: city.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />
        )}
        <View style={styles.cardMapButton}>
          <Map size={15} color={Palette.forest800} />
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text
          style={[styles.cardName, { color: theme.text }]}
          numberOfLines={1}
        >
          {city.name}
        </Text>
        <Text
          style={[styles.cardMeta, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {meta}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ── Skeleton Card ──────────────────────────────────────────────────────────

type SkeletonCardProps = { theme: typeof Colors.light };

const SkeletonCard = (props: SkeletonCardProps) => {
  const { theme } = props;
  return (
    <View
      style={[
        styles.card,
        styles.skeletonCard,
        { backgroundColor: theme.surfaceElevated },
      ]}
    />
  );
};

// ── Onboarding Empty State ─────────────────────────────────────────────────

type OnboardingEmptyProps = {
  theme: typeof Colors.light;
  onAdd: () => void;
};

const OnboardingEmpty = (props: OnboardingEmptyProps) => {
  const { theme, onAdd } = props;
  return (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconWrapper,
          { backgroundColor: theme.accentSubtle },
        ]}
      >
        <MapPin size={36} color={theme.accent} />
      </View>
      <Text
        style={[Typography.title, styles.emptyTitle, { color: theme.text }]}
      >
        Add your first city
      </Text>
      <Text
        style={[
          Typography.body,
          styles.emptyBody,
          { color: theme.textSecondary },
        ]}
      >
        Collect places you love — cafés, restaurants, hidden gems — organized by
        city.
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: theme.accent }]}
        onPress={onAdd}
        activeOpacity={0.85}
      >
        <Text style={styles.emptyButtonText}>Add a city</Text>
      </TouchableOpacity>
    </View>
  );
};

// ── Screen ─────────────────────────────────────────────────────────────────

export default function CitiesScreen() {
  const { cities, isLoading } = useCities();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const tabBarPadding = useBottomTabOverflow();

  const handleAdd = () => router.push("/cities/create");

  const handleCityPress = (city: CityWithCount) => {
    router.push({
      pathname: "/cities/[cityid]",
      params: { cityid: city.id, cityName: city.name },
    });
  };

  const isEmpty = !isLoading && (!cities || cities.length === 0);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      {/* Header — hidden during onboarding so the empty state fills the screen */}
      {!isEmpty && (
        <View style={styles.header}>
          <Text style={[Typography.title, { color: theme.text }]}>
            My Cities
          </Text>
          <IconButton
            icon="add"
            onPress={handleAdd}
            accessibilityLabel="Add a city"
          />
        </View>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <View style={styles.skeletonGrid}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonRow}>
              <SkeletonCard theme={theme} />
              <SkeletonCard theme={theme} />
            </View>
          ))}
        </View>
      )}

      {/* Onboarding */}
      {isEmpty && <OnboardingEmpty theme={theme} onAdd={handleAdd} />}

      {/* 2-column city grid */}
      {!isLoading && cities && cities.length > 0 && (
        <FlatList
          data={cities}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.gridContent,
            { paddingBottom: PADDING + tabBarPadding },
          ]}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <CityCard
              city={item}
              theme={theme}
              onPress={() => handleCityPress(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PADDING,
    paddingTop: 16,
    paddingBottom: 12,
  },
  gridContent: {
    padding: PADDING,
  },
  gridRow: {
    gap: GAP,
    marginBottom: GAP,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: Radius.lg,
  },
  skeletonCard: {
    height: CARD_HEIGHT,
  },
  cardImage: {
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    overflow: "hidden",
  },
  cardMapButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    backgroundColor: "rgba(251,250,245,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardFooter: {
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 15,
  },
  cardName: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 19,
    lineHeight: 23,
  },
  cardMeta: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  skeletonGrid: {
    padding: PADDING,
    gap: GAP,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: GAP,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptyBody: {
    textAlign: "center",
    maxWidth: 260,
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 26,
    paddingVertical: 15,
    borderRadius: 14,
  },
  emptyButtonText: {
    color: Palette.paper100,
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
  },
});
