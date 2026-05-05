import { useChangeOfferStatus } from "@/src/api/hooks/use-offer";
import { colors, rounded, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import { useRouter } from "expo-router";
import { CheckCircle, XCircle } from "lucide-react-native";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { LAYOUT_SPRING } from "./expandable-card";
import Animated from "react-native-reanimated";

interface OfferActionsProps {
  offer: Offer;
}

export default function OfferActions({ offer }: OfferActionsProps) {
  const router = useRouter();
  const { mutate: changeOfferStatus, isPending } = useChangeOfferStatus();

  const isOpen = offer.status === "OPEN";
  const isReserved = offer.status === "RESERVED";

  if (!isOpen && !isReserved) return null;

  const handleComplete = () => {
    Alert.alert(
      "Potwierdź zakończenie",
      "Czy kurier odebrał już opakowania? Oferta zostanie oznaczona jako zakończona.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Zakończ",
          style: "default",
          onPress: () => {
            changeOfferStatus(
              { offerId: offer.offer_id, newStatus: "COMPLETED" },
              {
                onSuccess: () => {
                  router.replace("/profile/offers/confirmation");
                },
                onError: (error) => {
                  const message =
                    error.response?.data?.message ||
                    "Nie udało się zakończyć oferty.";
                  Alert.alert("Błąd", message);
                },
              },
            );
          },
        },
      ],
    );
  };

  const handleCancel = () => {
    Alert.alert(
      "Anuluj ofertę",
      "Czy na pewno chcesz anulować tę ofertę? Nie będzie już widoczna dla kurierów.",
      [
        { text: "Wróć", style: "cancel" },
        {
          text: "Anuluj ofertę",
          style: "destructive",
          onPress: () => {
            changeOfferStatus(
              { offerId: offer.offer_id, newStatus: "CANCELED" },
              {
                onSuccess: () => {
                  router.back();
                },
                onError: (error) => {
                  const message =
                    error.response?.data?.message ||
                    "Nie udało się anulować oferty.";
                  Alert.alert("Błąd", message);
                },
              },
            );
          },
        },
      ],
    );
  };

  return (
    <Animated.View style={styles.container} layout={LAYOUT_SPRING}>
      <Pressable
        onPress={handleCancel}
        disabled={isPending}
        style={({ pressed }) => [
          styles.cancelButton,
          pressed && styles.cancelButtonPressed,
          isPending && styles.buttonDisabled,
        ]}
      >
        <XCircle size={18} color={colors.status.error} />
        <Text style={styles.cancelButtonText}>Anuluj ofertę</Text>
      </Pressable>

      {isReserved && (
        <ActionButton
          onPress={handleComplete}
          disabled={isPending}
          isPending={isPending}
          label="Potwierdź odbiór"
          icon={<CheckCircle size={18} color={colors.text.white} />}
        />
      )}
    </Animated.View>
  );
}

interface ActionButtonProps {
  onPress: () => void;
  disabled: boolean;
  isPending: boolean;
  label: string;
  icon: React.ReactNode;
}

export const ActionButton = ({
  onPress,
  disabled,
  isPending,
  label,
  icon,
}: ActionButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.completeButton,
        pressed && styles.completeButtonPressed,
        isPending && styles.buttonDisabled,
      ]}
    >
      {icon}
      <Text style={styles.completeButtonText}>
        {isPending ? "Zapisywanie..." : label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.md - 2,
    borderRadius: rounded.xl,
    borderWidth: 1.5,
    borderColor: colors.status.error,
    backgroundColor: colors.background.card,
  },
  cancelButtonPressed: {
    backgroundColor: "#FEF2F2",
  },
  cancelButtonText: {
    color: colors.status.error,
    fontWeight: "700",
    fontSize: 14,
  },
  completeButton: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.md - 2,
    borderRadius: rounded.xl,
    backgroundColor: colors.primary.base,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonPressed: {
    backgroundColor: colors.primary.dark,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  completeButtonText: {
    color: colors.text.white,
    fontWeight: "700",
    fontSize: 14,
  },
});
