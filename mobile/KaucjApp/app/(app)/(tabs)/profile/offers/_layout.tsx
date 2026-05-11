import { colors } from "@/src/theme";
import { HeaderBackButton } from "@react-navigation/elements";
import { Stack, useRouter } from "expo-router";

export default function OffersLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "Moje oferty",
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
          headerTitle: "Szczegóły oferty",
          headerLargeTitleEnabled: false,
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen name="confirmation" options={{ headerShown: false }} />

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
    </Stack>
  );
}
