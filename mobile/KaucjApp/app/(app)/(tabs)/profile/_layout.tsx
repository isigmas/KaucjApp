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
        name="test-review"
        options={{
          headerShown: false,
          presentation: "transparentModal",
        }}
      />

      <Stack.Screen
        name="stats"
        options={{
          headerShown: true,
          headerTitle: "Moje statystyki",
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
