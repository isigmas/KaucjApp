import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/src/theme";
import CardTitle from "../card-title";
import SwipeToReserve from "./slider";
import { useReserveOffer } from "@/src/api/hooks/use-offer";

interface ReserveOfferProps {
  offerId: number;
  totalIncome: number;
}

export default function ReserveOffer({
  offerId,
  totalIncome,
}: ReserveOfferProps) {
  const { mutateAsync, isPending, isError } = useReserveOffer(
    offerId,
    totalIncome.toString(),
  );

  return (
    <View>
      <CardTitle>Rezerwacja oferty</CardTitle>

      <SwipeToReserve onComplete={mutateAsync} disabled={isPending} />

      {isError && (
        <Text style={styles.errorText}>
          Coś poszło nie tak, spróbuj ponownie
        </Text>
      )}

      <Text style={styles.hint}>
        Twoja rezerwacja jest bezpieczna i możliwa do anulowania
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.status.error,
    textAlign: "center",
  },
  hint: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
});
