//this is the Stack Layout for cities flow
import { CitiesStackParamList } from "@/types/navigators";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Stack } from "expo-router";

export type CitiesStackScreenProps<T extends keyof CitiesStackParamList> = NativeStackScreenProps<CitiesStackParamList, T>;

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