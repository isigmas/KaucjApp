import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, headerLargeTitleEnabled: false }}
      />

      <Stack.Screen
        name="sheet"
        options={{
          presentation: "formSheet",
          headerTitle: "Szczegóły oferty",
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent" },
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.5, 1],
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </Stack>
  );
}
