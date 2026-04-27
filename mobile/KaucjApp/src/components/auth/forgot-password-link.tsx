import { colors, spacing } from "@/src/theme";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function ForgotPassword() {
  return (
    <View style={styles.forgotPasswordContainer}>
      <Pressable onPress={() => {}}>
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
