import { View, Text, Pressable, StyleSheet } from "react-native";
import React from "react";
import { colors } from "@/src/theme";
import { OfferData } from "./create-offer";

interface Step1QuantityProps {
  data: OfferData;
  updateData: (newData: Partial<OfferData>) => void;
}

export default function Step1Quantity({
  data,
  updateData,
}: Step1QuantityProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>1. What do you have?</Text>
      <Text>Plastic Bottles: {data.plasticBottles}</Text>
      <Text>Glass Bottles: {data.glassBottles}</Text>
      <Text>Cans: {data.cans}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: { flex: 1 },
  stepTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 24,
  },
});
