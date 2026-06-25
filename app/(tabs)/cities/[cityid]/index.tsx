import { SpotCard } from "@/components/SpotCard";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { Colors, Palette } from "@/constants/Colors";
import { Radius } from "@/constants/Theme";
import { FontFamily, Typography } from "@/constants/Typography";
import { useCity } from "@/hooks/useCity";
import { useSpot } from "@/hooks/useSpot";
import { useTags } from "@/hooks/useTags";
import { Tag } from "@/types";
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

export default function CityScreen() {
  const router = useRouter();
  const { cityid, cityName } = useLocalSearchParams<CityRouteParams>();
  const { isLoading, spots, deleteCity } = useCity(cityid);
  const { deleteSpot } = useSpot(cityid);
  const { tags: allTags } = useTags();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const tabBarPadding = useBottomTabOverflow();

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
      edges={["top"]}
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
        contentContainerStyle={[
          styles.list,
          { paddingBottom: 24 + tabBarPadding },
        ]}
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
    borderWidth: 1.5,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipText: {
    fontFamily: FontFamily.semiBold,
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
    fontFamily: FontFamily.monoMedium,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  addButton: {
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  addButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: Palette.paper100,
  },
  list: {
    paddingBottom: 24,
  },
  emptyState: {
    paddingHorizontal: 16,
    paddingTop: 32,
    alignItems: "center",
  },
});
