import { colors, spacing } from "@/src/theme";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function ForgotPassword() {
  const router = useRouter();

  return (
    <View style={styles.forgotPasswordContainer}>
      <Pressable onPress={() => router.push("/(auth)/password-reset")}>
        <Text style={styles.forgotPasswordText}>Zapomniałeś hasła?</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  forgotPasswordContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary.dark,
  },
});
