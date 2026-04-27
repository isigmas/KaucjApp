import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing } from "@/src/theme";

type Props = {
  password?: string;
};

export function PasswordChecklist({ password = "" }: Props) {
  const rules = [
    { label: "Co najmniej 6 znaków", fulfilled: password.length >= 6 },
    { label: "Wielka litera", fulfilled: /[A-Z]/.test(password) },
    { label: "Mała litera", fulfilled: /[a-z]/.test(password) },
    { label: "Cyfra", fulfilled: /[0-9]/.test(password) },
    { label: "Znak specjalny", fulfilled: /[^a-zA-Z0-9]/.test(password) },
  ];

  return (
    <View style={styles.container}>
      {rules.map((rule, index) => {
        const isMet = rule.fulfilled;

        return (
          <View key={index} style={styles.ruleRow}>
            <Feather
              name={isMet ? "check-circle" : "circle"}
              size={14}
              color={isMet ? colors.status.success : colors.text.muted}
            />
            <Text
              style={[
                styles.ruleText,
                { color: isMet ? colors.text.primary : colors.text.muted },
              ]}
            >
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
    gap: 4,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ruleText: {
    fontSize: 13,
    marginLeft: 6,
  },
});
