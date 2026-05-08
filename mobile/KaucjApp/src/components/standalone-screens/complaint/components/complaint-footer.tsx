import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, spacing } from "@/src/theme";
import InfoNote from "./info-note";
import SubmitButton from "./submit-button";

interface ComplaintFooterProps {
  onSubmit: () => void;
  isLoading: boolean;
}

export default function ComplainScreenFooter({
  onSubmit,
  isLoading,
}: ComplaintFooterProps) {
  return (
    <>
      <View style={styles.divider} />
      <View style={styles.container}>
        <InfoNote />
        <SubmitButton onPress={onSubmit} isLoading={isLoading} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.status.border,
    marginBottom: spacing.md,
  },
  container: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
});
