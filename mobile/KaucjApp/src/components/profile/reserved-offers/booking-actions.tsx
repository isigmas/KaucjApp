import {
  useChangeOfferStatus,
  useConfirmOffer,
} from "@/src/api/hooks/use-offer";
import { colors, rounded, spacing } from "@/src/theme";
import { useRouter } from "expo-router";
import { Check, MessageCircle } from "lucide-react-native";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

interface BookingActionsProps {
  offerId: number;
}

export default function BookingActions({ offerId }: BookingActionsProps) {
  const router = useRouter();
  const { mutate: confirmOffer, isPending } = useConfirmOffer(offerId);

  const handleComplete = () => {
    Alert.alert(
      "Potwierdź odbiór",
      "Potwierdzasz, że odebrałeś opakowania od sprzedającego?",
      [
        { text: "anuluj", style: "cancel" },
        {
          text: "Potwierdzam",
          style: "default",
          onPress: () => {
            confirmOffer();
          },
        },
      ],
    );
  };

  const handleContact = () => {
    Alert.alert(
      "Wkrótce",
      "Funkcja kontaktu ze sprzedającym będzie dostępna już niedługo.",
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleContact}
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.secondaryButtonPressed,
        ]}
      >
        <MessageCircle size={18} color={colors.primary.base} />
        <Text style={styles.secondaryButtonText}>Skontaktuj się</Text>
      </Pressable>

      <Pressable
        onPress={handleComplete}
        disabled={isPending}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.primaryButtonPressed,
          isPending && styles.primaryButtonDisabled,
        ]}
      >
        <Check size={18} color={colors.text.white} />
        <Text style={styles.primaryButtonText}>
          {isPending ? "Potwierdzanie..." : "Potwierdź odbiór"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.md - 2,
    borderRadius: rounded.xl,
    borderWidth: 1.5,
    borderColor: colors.primary.base,
    backgroundColor: colors.background.card,
  },
  secondaryButtonPressed: {
    backgroundColor: colors.primary.light,
  },
  secondaryButtonText: {
    color: colors.primary.base,
    fontWeight: "700",
    fontSize: 15,
  },
  primaryButton: {
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
  primaryButtonPressed: {
    backgroundColor: colors.primary.dark,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.text.white,
    fontWeight: "700",
    fontSize: 15,
  },
});
