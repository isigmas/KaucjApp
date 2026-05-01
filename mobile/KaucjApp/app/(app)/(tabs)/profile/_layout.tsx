import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, headerLargeTitleEnabled: false }}
      />
      <Stack.Screen
        name="profileSettings/index"
        options={{ headerShown: false, headerLargeTitleEnabled: false }}
      />

      <Stack.Screen
        name="offers"
        options={{
          headerTitle: "Moje oferty",
          headerLargeTitleEnabled: true,
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="bookings"
        options={{
          headerShown: false,
          headerLargeTitleEnabled: true,
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "Moje rezerwacje",
        }}
      />
    </Stack>
  );
}
