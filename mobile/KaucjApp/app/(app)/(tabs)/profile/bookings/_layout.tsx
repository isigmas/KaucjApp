import { colors } from "@/src/theme";
import { HeaderBackButton } from "@react-navigation/elements";
import { Stack, useRouter } from "expo-router";
import { Info } from "lucide-react-native";

export default function BookingsLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "Moje rezerwacje",
          headerLargeTitleEnabled: true,
          headerBackButtonDisplayMode: "minimal",

          headerLeft: () => (
            <HeaderBackButton
              tintColor={colors.text.primary}
              labelStyle={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text.primary,
              }}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/profile");
                }
              }}
            />
          ),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: "Szczegóły rezerwacji",
          headerLargeTitleEnabled: false,
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <Stack.Screen
        name="complaint"
        options={{
          headerTitle: "Zgłoś problem",
          headerLargeTitleEnabled: false,
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [1],
          contentStyle: { backgroundColor: "transparent" },
        }}
      />

      <Stack.Screen
        name="confirmation"
        options={{
          headerShown: false,
          presentation: "transparentModal",
        }}
      />

      <Stack.Screen
        name="profile-details-sheet"
        options={{
          headerShown: false,
          headerTransparent: true,
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.8, 1],
        }}
      />
    </Stack>
  );
}
