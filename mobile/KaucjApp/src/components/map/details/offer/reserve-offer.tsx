import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@/src/theme";
import CardTitle from "../card-title";
import SwipeToReserve from "./booking/swipe-to-reserve";
import { useChangeOfferStatus } from "@/src/api/hooks/use-offer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReserveOfferProps {
  offerId: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReserveOffer({ offerId }: ReserveOfferProps) {
  const { mutateAsync, isPending, isError, reset } = useChangeOfferStatus();

  // Wrapped in useCallback so SwipeToReserve's pan gesture handler receives
  // a stable reference and does not recreate the Gesture object on each render.
  const handleComplete = React.useCallback(async () => {
    // Reset any previous error state before retrying.
    reset();
    await mutateAsync({ offerId, newStatus: "RESERVED" });
  }, [mutateAsync, reset, offerId]);

  return (
    <View style={styles.container}>
      <CardTitle>Rezerwacja oferty</CardTitle>

      <SwipeToReserve
        onComplete={handleComplete}
        // Keep the slider locked while the mutation is in flight, preventing
        // double-submission if the sheet is still mounted after success.
        disabled={isPending}
      />

      {/* Error message is driven by React Query's isError — single source of
          truth. It resets automatically when handleComplete calls reset(). */}
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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
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
