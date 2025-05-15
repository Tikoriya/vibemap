import { useCities } from "@/hooks/useCities";
import { useRouter } from "expo-router";
import React from "react";
import { Button, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



export default function CitiesScreen() {
  const { cities } = useCities();
  const router = useRouter();


  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.title}>Cities</Text>
        <Button title="Create New City" onPress={() => router.push("/cities/create")} />
        <FlatList
          data={cities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.cityCard} onPress={() => router.push({pathname: "/cities/[cityid]", params: {cityid:item.id, cityName: item.name}})}> 
              <Image source={{ uri: item.imageUrl ?? '' }} style={styles.cityImage} />
              <Text style={styles.cityName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, backgroundColor: "#fff", borderWidth: 1 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  listContent: { paddingBottom: 24 },
  cityCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 12,
  },
  cityImage: { width: 60, height: 60, borderRadius: 8, marginRight: 16 },
  cityName: { fontSize: 18, fontWeight: "500" },
});

