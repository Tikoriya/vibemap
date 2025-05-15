import { useCreateSpot } from "@/hooks/useCreateSpot";
import { useCreateTag } from "@/hooks/useCreateTag";
import { tagsSpotsApi } from "@/lib/supabase/tags_spots";
import { NewSpot, NewSpotTag, NewTag } from "@/types";
import { CreateSpotRouteParams } from "@/types/navigators";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";


const CreateSpot = () => {
  const router = useRouter();
  const { cityid } = useLocalSearchParams<CreateSpotRouteParams>();
  const { mutateAsync } = useCreateSpot(cityid);
  const {mutateAsync: mutateAsyncTags} = useCreateTag()


  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  const handleTags = async (tagList: string[]) => {
    const newTags: NewTag[] = tagList.map((tag) => ({label: tag}))
    return await mutateAsyncTags(newTags);
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
    
    // 2. Create the spot
    const newSpot: NewSpot = {  
      name,
      notes,
      city_id: parseInt(cityid as string),
    };
    const createdSpot = await mutateAsync(newSpot);

    //3. Create the tags
    if (tagList.length > 0) {
       handleTags(tagList).then(async (createdTags) => {
        // 4. Create the links between the spot and tags
        const spotTagLinks = createdTags.map(tag => ({
          spot_id: createdSpot.id,
          tag_id: tag.id,
        }));  
        await tagsSpotsApi.createTagsSpots(spotTagLinks as NewSpotTag[]);
      })
    }

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