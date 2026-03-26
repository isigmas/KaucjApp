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
        options={{
          title: "Moje rezerwacje",
          headerTintColor: colors.primary.base,
          headerTitleStyle: {
            color: colors.text.primary,
            fontSize: 18,
            fontWeight: "700",
          },
          headerBackTitle: "",
          headerLeft: ({ tintColor }) => (
            <Pressable
              onPress={() => router.back()}
              style={{ padding: 8 }}
            >
              <ChevronLeft size={24} color={tintColor} />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
