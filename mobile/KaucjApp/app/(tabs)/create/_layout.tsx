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
    </Stack>
  );
}
