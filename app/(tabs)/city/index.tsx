import { useSpotStore } from "@/lib/store";
import { CityStackParamList } from "@/types/navigators";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Button, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function CityScreen() {
  const { spots, addSpot } = useSpotStore();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<CityStackParamList>>();
  
  // Get all unique tags from spots
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    spots.forEach(spot => spot.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [spots]);

  // Filter spots by selected tag
  const filteredSpots = selectedTag
    ? spots.filter(spot => spot.tags.includes(selectedTag))
    : spots;

  return (
    <SafeAreaView>
      <View>
        <Text>Lisbon</Text>
         <Button
          title="Add Spot"
          onPress={() =>
            navigation.navigate("create", {
              spots,
              addSpot,
              onSubmit: () => navigation.goBack(),
            })
          }
        />
        <FlatList
          data={allTags}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
          style={{ marginVertical: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tagButton,
                selectedTag === item && styles.tagButtonSelected,
              ]}
              onPress={() => setSelectedTag(selectedTag === item ? null : item)}
            >
              <Text style={[
                styles.tagText,
                selectedTag === item && styles.tagTextSelected,
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
       
        <FlatList
          data={filteredSpots}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.spotCard} key={item.name}>
              <Text style={styles.spotName}>{item.name}</Text>
              <Text style={styles.spotType}>{item.type}</Text>
              <Text style={styles.spotTags}>{item.tags.join(", ")}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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