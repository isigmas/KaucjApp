import { View, Text, StyleSheet } from "react-native";

import { colors, rounded } from "@/src/theme";

type Props = {
  message?: string;
  fallback?: string;
};

export function ErrorBanner({ message, fallback }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message || fallback}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: rounded.lg,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.status.error,
  },
  text: {
    color: colors.status.error,
    fontSize: 14,
    fontWeight: "500",
  },
});
