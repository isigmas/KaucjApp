import { useChangeOfferStatus } from "@/src/api/hooks/use-offer";
import { colors, rounded, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import { useRouter } from "expo-router";
import { CheckCircle, XCircle } from "lucide-react-native";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { LAYOUT_SPRING } from "../../ui/expandable-card";
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
              { offerId: offer.offerId, newStatus: "CANCELED" },
              {
                onSuccess: () => {
                  router.push({
                    pathname: "/profile/offers/confirmation",
                    params: { type: "cancel" },
                  });
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
    </Animated.View>
  );
}

interface ActionButtonProps {
  onPress: () => void;
  disabled: boolean;
  isPending: boolean;
  label: string;
  backgroundColor?: string;
  icon: React.ReactNode;
}

export const ActionButton = ({
  onPress,
  disabled,
  isPending,
  label,
  icon,
  backgroundColor = colors.primary.base,
}: ActionButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { backgroundColor: backgroundColor },
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
