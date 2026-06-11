import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, headerLargeTitleEnabled: false }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          headerLargeTitleEnabled: false,
          headerTitle: "Ustawienia",
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="offers"
        options={{
          headerShown: false,
          headerLargeTitleEnabled: true,
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "Moje rezerwacje",
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

      <Stack.Screen
        name="ranking"
        options={{
          headerShown: true,
          headerTitle: "Ranking",
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="stats"
        options={{
          headerShown: false,
          headerTitle: "Mój profil",
          headerLargeTitleEnabled: false,
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: true,
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.9, 1],
        }}
      />
    </Stack>
  );
}
