import { GoogleAutoComplete } from "@/components/GoogleAutoComplete";
import { useCreateTag } from "@/hooks/useCreateTag";
import { useSpot } from "@/hooks/useSpot";
import { useAuthStore } from "@/lib/store";
import { tagsSpotsApi } from "@/lib/supabase/tags_spots";
import { NewSpot, NewSpotTag, NewTag } from "@/types";
import { CreateSpotRouteParams } from "@/types/navigators";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";


const CreateSpot = () => {
  const router = useRouter();
  const { cityid } = useLocalSearchParams<CreateSpotRouteParams>();
  const { createSpot } = useSpot(cityid);
  const { user } = useAuthStore()
  const {mutateAsync: mutateAsyncTags} = useCreateTag()


  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  const handleTags = async (tagList: string[]) => {
    const newTags: NewTag[] = tagList.map((tag) => ({label: tag, user_id: user?.id}));
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
    const createdSpot = await createSpot(newSpot);

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

  const onSearchError = React.useCallback((error: any) => {
  console.log(error);
}, []);

const onPlaceSelected = React.useCallback((place: any) => {
  console.log(place);
}, []);
const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
        <GoogleAutoComplete />
      </View>
    </View>
  
  //     />
      /* <View>
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
      </View> */
    // </View>
  );
};

const styles = StyleSheet.create({
   container: {
    backgroundColor: "darkblue",
    paddingTop: 60,
    paddingBottom: 25,
    alignItems: "center",
    borderBottomLeftRadius: 55,
    borderBottomRightRadius: 55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 50,
  },
  googlePlacesText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    height: 50,
    borderRadius: 25,
    paddingLeft: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputContainer: {
    width: "95%",
  },
  textInputFocused: {
    borderWidth: 1,
    borderColor: "darkblue",
    height: 50,
    borderRadius: 25,
    paddingLeft: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default CreateSpot;