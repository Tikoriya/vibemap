//this is the Stack Layout for cities flow
import { Stack } from "expo-router";


export default function CitiesStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: "Cities" }} />
      <Stack.Screen name="create" options={{ title: "Create City" }} />
      <Stack.Screen
        name="[cityId]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}