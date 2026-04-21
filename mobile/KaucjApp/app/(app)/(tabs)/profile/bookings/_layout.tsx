import { Stack, useRouter } from "expo-router";
import { colors } from "@/src/theme";
import { ChevronLeft } from "lucide-react-native";
import { Pressable } from "react-native";

export default function HomeLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, headerLargeTitleEnabled: false }}
      />
    </Stack>
  );
}
