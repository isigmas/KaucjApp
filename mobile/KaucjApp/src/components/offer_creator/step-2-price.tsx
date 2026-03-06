import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { OfferData } from "./create-offer";
import { colors } from "@/src/theme";

interface Step2PricingProps {
  data: OfferData;
  updateData: (newData: Partial<OfferData>) => void;
}

export default function Step2Price({ data, updateData }: Step2PricingProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>2. Za ile oddasz butelki?</Text>
      <Text>Current Price: {data.askingPrice} PLN</Text>
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
