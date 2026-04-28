import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { colors, rounded, spacing } from "@/src/theme";
import { useRouter } from "expo-router";
import { Offer } from "@/src/types";

interface ReserveButtonProps {
  offer: Offer;
}

export default function ReserveButton({ offer }: ReserveButtonProps) {
  const router = useRouter();

  const handleReserve = () => {
    router.push({
      pathname: "/(app)/(tabs)/home/reserve-screen",
      params: { offerData: JSON.stringify(offer) },
    });
  };

  return (
    <Pressable
      onPress={handleReserve}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? colors.primary.dark : colors.primary.base,
        },
      ]}
    >
      <Text style={styles.label}>Zarezerwuj ofertę</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: rounded.xl,
    alignSelf: "center",
    marginTop: spacing.lg,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  pending: {
    opacity: 0.7,
  },
  label: {
    color: colors.text.white,
    fontWeight: "600",
    fontSize: 20,
  },
});
