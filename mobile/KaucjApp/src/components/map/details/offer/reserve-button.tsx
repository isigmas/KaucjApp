import React from "react";
import {
  Pressable,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { colors, rounded, spacing } from "@/src/theme";
import { useChangeOfferStatus } from "@/src/api/hooks/use-offer";

interface ReserveButtonProps {
  offerId: number;
  onSuccessCallback?: () => void;
}

export default function ReserveButton({
  offerId,
  onSuccessCallback,
}: ReserveButtonProps) {
  const { mutate: changeOfferStatus, isPending } = useChangeOfferStatus();

  const handleReserve = () => {
    if (isPending) return;

    changeOfferStatus(
      { offerId, newStatus: "RESERVED" },
      {
        onSuccess: () => {
          Alert.alert("Sukces", "Oferta została pomyślnie zarezerwowana!");
          if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error) => {
          const errorMessage =
            error.response?.data?.message ||
            "Nie udało się zarezerwować oferty.";
          Alert.alert("Błąd", errorMessage);
        },
      },
    );
  };

  return (
    <Pressable
      onPress={handleReserve}
      disabled={isPending}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? colors.primary.dark : colors.primary.base,
        },
        isPending && styles.pending,
      ]}
    >
      {isPending && (
        <ActivityIndicator color={colors.text.white} size="small" />
      )}
      <Text style={styles.label}>
        {isPending ? "Rezerwowanie..." : "Zarezerwuj"}
      </Text>
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
