import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, headerLargeTitleEnabled: false }}
      />
      <Stack.Screen
        name="confirmation"
        options={{ headerShown: false, headerLargeTitleEnabled: false }}
      />
    </Stack>
  );
}
