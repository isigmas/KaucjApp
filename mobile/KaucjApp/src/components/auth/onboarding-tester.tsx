import { View, Text, StyleSheet } from "react-native";

import { colors } from "@/src/theme";
import { ResetOnboardingButton } from "../onboarding/reset-onboarding-button";

export function TestFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Tylko dla testów, najepiej po kliknięciu odświezyć expo go
      </Text>
      <ResetOnboardingButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    alignItems: "center",
    opacity: 0.5,
  },
  label: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 10,
  },
});
