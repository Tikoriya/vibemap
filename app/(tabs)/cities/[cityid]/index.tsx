import { Colors } from "@/constants/Colors";
import { FontFamily, Typography } from "@/constants/Typography";
import { useCity } from "@/hooks/useCity";
import { useSpot } from "@/hooks/useSpot";
import { useTags } from "@/hooks/useTags";
import { Spot, Tag } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CityRouteParams = {
  cityid: string;
  cityName?: string;
};

function SpotCard(props: {
  spot: Spot;
  onPress: () => void;
  onDelete: () => void;
  theme: typeof Colors.light;
}) {
  const { spot, onPress, onDelete, theme } = props;
  const tags = (spot as any).tags as Tag[] | undefined;

  const handleDelete = () => {
    Alert.alert("Delete spot", `Remove "${spot.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.cardHeader}>
        <Text
          style={[Typography.cardTitle, styles.cardName, { color: theme.text }]}
          numberOfLines={1}
        >
          {spot.name}
        </Text>
        <TouchableOpacity
          onPress={handleDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.deleteIcon, { color: theme.textSecondary }]}>×</Text>
        </TouchableOpacity>
      </View>

      {spot.address ? (
        <Text
          style={[Typography.secondary, styles.cardAddress, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {spot.address}
        </Text>
      ) : null}

      {tags && tags.length > 0 ? (
        <View style={styles.cardTags}>
          {tags.map((tag) => (
            <View
              key={tag.id}
              style={[styles.tagChip, { backgroundColor: theme.accentSubtle }]}
            >
              <Text style={[styles.tagText, { color: theme.accent }]}>
                {tag.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function CityScreen() {
  const router = useRouter();
  const { cityid, cityName } = useLocalSearchParams<CityRouteParams>();
  const { isLoading, spots, deleteCity } = useCity(cityid);
  const { deleteSpot } = useSpot(cityid);
  const { tags: allTags } = useTags();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const filteredSpots =
    selectedTagIds.length > 0
      ? spots?.filter(
          (spot) =>
            Array.isArray((spot as any).tags) &&
            (spot as any).tags.some((tag: Tag) =>
              selectedTagIds.includes(tag.id.toString())
            )
        )
      : spots;

  const handleDeleteCity = () => {
    Alert.alert("Delete city", "This will remove the city and all its spots.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCity(parseInt(cityid));
          router.push("/cities");
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[styles.backText, { color: theme.accent }]}>‹ Cities</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteCity} activeOpacity={0.7}>
          <Text style={[styles.deleteText, { color: theme.textSecondary }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredSpots}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* City title */}
            <Text style={[Typography.title, styles.cityTitle, { color: theme.text }]}>
              {cityName ?? "City"}
            </Text>

            {/* Tag filters */}
            {allTags && allTags.length > 0 ? (
              <FlatList
                data={allTags}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterBar}
                renderItem={({ item }) => {
                  const active = selectedTagIds.includes(item.id.toString());
                  return (
                    <TouchableOpacity
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: active ? theme.accent : theme.surface,
                          borderColor: active ? theme.accent : theme.border,
                        },
                      ]}
                      onPress={() => toggleTag(item.id.toString())}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: active ? "#FFFFFF" : theme.text },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            ) : null}

            {/* Spots heading + add button */}
            <View style={styles.spotsHeader}>
              <Text style={[styles.spotsCount, { color: theme.textSecondary }]}>
                {filteredSpots?.length ?? 0}{" "}
                {filteredSpots?.length === 1 ? "spot" : "spots"}
              </Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.accent }]}
                onPress={() =>
                  router.push({
                    pathname: "/cities/[cityid]/create",
                    params: { cityid },
                  })
                }
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>+ Add spot</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[Typography.body, { color: theme.textSecondary }]}>
              No spots yet. Add your first one.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <SpotCard
            spot={item}
            theme={theme}
            onPress={() =>
              router.push({
                pathname: "/cities/[cityid]/[spotid]",
                params: { cityid, spotid: item.id.toString() },
              })
            }
            onDelete={() => deleteSpot(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backText: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
  },
  deleteText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
  },
  cityTitle: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  filterChipText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
  },
  spotsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  spotsCount: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  list: {
    paddingBottom: 24,
  },
  emptyState: {
    paddingHorizontal: 16,
    paddingTop: 32,
    alignItems: "center",
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  cardName: {
    flex: 1,
  },
  deleteIcon: {
    fontFamily: FontFamily.regular,
    fontSize: 22,
    lineHeight: 24,
  },
  cardAddress: {
    marginTop: 2,
  },
  cardTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  tagChip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
  },
});
