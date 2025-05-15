import { useCreateSpot } from "@/hooks/useCreateSpot";
import { tagsApi } from "@/lib/supabase/tags";
import { NewSpot } from "@/types";
import { CreateSpotRouteParams } from "@/types/navigators";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";


const CreateSpot = () => {
  const router = useRouter();
  const { cityid } = useLocalSearchParams<CreateSpotRouteParams>();
  const { mutate, isPending } = useCreateSpot(cityid);


  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  const handleTags = async (tagList: string[]) => {
      return await tagsApi.createTags(tagList);
  }

  const handleSubmit = async () => {
    if (!name) {
      Alert.alert("Please fill in all required fields.");
      return;
    }

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    // Create tags in the database if needed (assuming spotsApi.createTags returns created tags)
    // let createdTags: Tag[] = [];
    // if (tagList.length > 0) {
    //   createdTags = await handleTags(tagList);
    // }

    // 2. Create the spot
    const newSpot: NewSpot = {  
      name,
      notes,
      city_id: parseInt(cityid as string),
    };

    mutate(newSpot);



    // 3. Insert into spot_tags join table
    
    setName("");
    setType("");
    setTags("");
    setNotes("");
    router.back();
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