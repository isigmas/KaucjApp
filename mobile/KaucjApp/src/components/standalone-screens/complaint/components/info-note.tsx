import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, rounded, spacing } from "@/src/theme";

export default function InfoNote() {
  return (
    <View style={styles.container}>
      <Feather
        name="info"
        size={13}
        color={colors.accent.base}
        style={styles.icon}
      />
      <Text style={styles.text}>
        Fałszywe zgłoszenia mogą skutkować ograniczeniem dostępu do konta.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.accent.light,
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    gap: spacing.xs + 2,
  },
  icon: { marginTop: 2 },
  text: {
    flex: 1,
    fontSize: 12,
    color: colors.accent.dark,
    lineHeight: 17,
  },
});
