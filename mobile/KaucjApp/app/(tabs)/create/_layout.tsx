import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerLargeTitleEnabled: false,
          headerTransparent: true,
          title: "Nowa oferta",
        }}
      />

      <Stack.Screen
        name="map-sheet"
        options={{
          presentation: "formSheet",
          headerTitle: "Wybierz lokalizację",
          headerStyle: { backgroundColor: "transparent" },
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.8, 1],
          contentStyle: { backgroundColor: "transparent" },
        }}
      />

      <Stack.Screen
        name="success-screen"
        options={{
          headerShown: true,
          headerLargeTitleEnabled: false,
          headerTransparent: true,
          title: "Potwierdzenie",
        }}
      />
    </Stack>
  );
}
