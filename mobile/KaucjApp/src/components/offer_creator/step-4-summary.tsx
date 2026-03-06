import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { OfferData } from "./create-offer";
import { colors } from "@/src/theme";

interface Step4SummaryProps {
  data: OfferData;
  updateData: (newData: Partial<OfferData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Summary({
  data,
  updateData,
  onNext,
  onBack,
}: Step4SummaryProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>4. Summary</Text>
      <View style={styles.summaryBox}>
        <Text>Total Items: {data.bottles + data.cans}</Text>
        <Text>Your Profit: {data.askingPrice} PLN</Text>
        <Text>Location: {data.location}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: { flex: 1 },
  stepTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 24,
  },

  summaryBox: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
