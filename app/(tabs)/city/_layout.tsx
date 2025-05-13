import { Stack } from "expo-router";

export default function CityStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "City" }} />
      <Stack.Screen name="create" options={{ title: "Create Spot" }} />
    </Stack>
  );
}