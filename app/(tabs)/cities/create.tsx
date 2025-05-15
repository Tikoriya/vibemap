//this is going to be create new city page
import { useCities } from "@/hooks/useCities";
import citiesApi from "@/lib/supabase/citites";
import { NewCity } from "@/types";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";


export default function CreateCityScreen() {
  const [name, setName] = useState("");
  const router = useRouter();
  const {refetchCity} = useCities()

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("City name is required");
      return;
    }

    const city: NewCity = {
      name: name.trim(),
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",    
    }

    await citiesApi.createCity(city)
    await refetchCity();
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New City</Text>
      <TextInput
        style={styles.input}
        placeholder="City name"
        value={name}
        onChangeText={setName}
      />
      <Button title="Add City" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
});

