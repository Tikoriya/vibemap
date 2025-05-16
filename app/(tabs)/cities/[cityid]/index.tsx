import { useCity } from "@/hooks/useCity";
import { useSpot } from "@/hooks/useSpot";
import { useTags } from "@/hooks/useTags";
import { Tag } from "@/types";
import { CityRoutePrams } from "@/types/navigators";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function CityScreen() {
  const router = useRouter();
  const { cityid, cityName } = useLocalSearchParams<CityRoutePrams>();
  const { isLoading, spots, deleteCity } = useCity(cityid);
  const { deleteSpot } = useSpot(cityid);
  const { tags: allTags } = useTags()
  
  // Change to array for multiple selection
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  
  // Load city and spots using the custom hook
  if (isLoading) return <Text>Loading...</Text>;

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  // Filter spots by any selected tag
  const filteredSpots =
    selectedTags.length > 0
      ? spots?.filter(
          (spot) =>
            Array.isArray(spot.tags) &&
            spot.tags.some((tag: any) =>
              selectedTags.includes(tag.id?.toString())
            )
        )
      : spots;

  const handleDeleteSpot = async (spotId: number) => {
    await deleteSpot(spotId);
    // Optionally, refetch or update the list if your hook doesn't do it automatically
  };

  const handleDeleteCity = async () => {
    await deleteCity(parseInt(cityid));
    router.push("/cities");
  }

  const renderTags = (tags?: Tag[]) => {
    if (!tags || tags.length === 0) return null;
    const tagsStr = tags.map((t: Tag) => t.label).join(", ")
    return (
      <Text style={styles.spotTags}>
        {tagsStr}
      </Text>
    )
  }

  return (
    <SafeAreaView>
      <View>
        <Button
          title="Delete City"
          onPress={handleDeleteCity}
        />
        <Text style={styles.title}>{cityName}</Text>
        <Button
          title="Add Spot"
          onPress={() => router.push({ pathname: "/cities/[cityid]/create", params: { cityid } })}
        />
        <FlatList
          data={allTags}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
          style={{ marginVertical: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tagButton,
                selectedTags.includes(item.id.toString()) && styles.tagButtonSelected,
              ]}
              onPress={() => toggleTag(item.id.toString())}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedTags.includes(item.id.toString()) && styles.tagTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
        <FlatList
          data={filteredSpots}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
           <View style={styles.spotCard} key={item.id}>
              <View style={styles.spotCardHeader}>
                <Text style={styles.spotName}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleDeleteSpot(item.id)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              {renderTags(item.tags)}
              
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ...existing styles...
  spotCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  closeButton: {
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: "flex-end",
  },
  closeButtonText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 22,
  },
  // ...rest of your styles...
  title: { fontSize: 24, fontWeight: "bold", margin: 16 },
  tagsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tagButton: {
    backgroundColor: "#eee",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tagButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  tagText: {
    color: "#333",
    fontWeight: "500",
  },
  tagTextSelected: {
    color: "#fff",
  },
  listContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  spotCard: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
    minWidth: 180,
    alignItems: "flex-start",
  },
  spotName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  spotType: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  spotTags: {
    fontSize: 12,
    color: "#888",
  },
});