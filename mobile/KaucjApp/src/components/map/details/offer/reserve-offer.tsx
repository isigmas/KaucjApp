import { View, Text, StyleSheet } from "react-native";
import React from "react";
import SwipeToReserve from "./booking/swipe-to-reserve";
import { colors, spacing } from "@/src/theme";
import CardTitle from "../card-title";

export default function ReserveOffer() {
  return (
    <View style={styles.container}>
      <CardTitle>Rezerwacja oferty</CardTitle>
      <SwipeToReserve onComplete={() => {}} />

      <Text style={styles.hint}>
        Twoja rezerwacja jest bezpieczna i możliwa do anulowania
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  hint: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
  },
});
