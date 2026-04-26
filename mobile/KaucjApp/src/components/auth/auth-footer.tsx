import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { colors, spacing } from "@/src/theme";

type Props = {
  prompt: string;
  actionLabel: string;
  onPress: () => void;
};

export function AuthFooter({ prompt, actionLabel, onPress }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{prompt}</Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        <Text style={styles.action}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  prompt: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  action: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary.dark,
  },
});
