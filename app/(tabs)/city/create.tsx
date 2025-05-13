import { Spot } from "@/types";
import { CityStackParamList } from "@/types/navigators";
import { useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Button, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

type CreateScreenNavigationProp = NativeStackNavigationProp<CityStackParamList, "create">;

const CreateSpot = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const route = useRoute();
  // const { spots, addSpot } = useSpotStore();
  const {spots, addSpot, onSubmit } = route.params as CityStackParamList["create"];

  const handleSubmit = () => {
    if (!name || !type) return;
    const newSpot: Spot = {
      id: (spots?.length + 1).toString(),
      name,
      type,
      tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
      notes,
      city: "Lisbon", // or make this dynamic if needed
    };
    addSpot(newSpot);
    setName("");
    setType("");
    setTags("");
    setNotes("");
    onSubmit();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Spot name"
        />
        <Text style={styles.label}>Type</Text>
        <TextInput
          style={styles.input}
          value={type}
          onChangeText={setType}
          placeholder="Spot type"
        />
        <Text style={styles.label}>Tags (comma separated)</Text>
        <TextInput
          style={styles.input}
          value={tags}
          onChangeText={setTags}
          placeholder="e.g. scenic, outdoor"
        />
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.input}
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes"
        />
        <Button title="Add Spot" onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: "bold" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 8 },
});

export default CreateSpot;