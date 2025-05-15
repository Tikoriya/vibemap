import { Stack } from "expo-router";

export default function CityStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false, title: "City" }} />
      <Stack.Screen name="spot/create" options={{ title: "Create Spot" }} />
    </Stack>
  );
}