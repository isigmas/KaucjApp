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
            name="rewards/index.tsx"
            options={{ headerShown: false, headerLargeTitleEnabled: false }}
        />
        <Stack.Screen
            name="rewards/rewardsHowWork/index.tsx"
            options={{ headerShown: false, headerLargeTitleEnabled: false }}
        />

    </Stack>
  );
}
