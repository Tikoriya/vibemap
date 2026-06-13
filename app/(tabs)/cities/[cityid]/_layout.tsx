import { Stack } from "expo-router";

export default function CityStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="[spotid]" />
    </Stack>
  );
}