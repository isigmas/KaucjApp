import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function HomeLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false, headerLargeTitleEnabled: false }}
        />
        <Stack.Screen
          name="reserve-screen"
          options={{
            headerTitle: "",
            headerLargeTitleEnabled: false,
            headerTransparent: true,
            headerBackButtonDisplayMode: "minimal",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
