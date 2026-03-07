import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { colors } from "@/src/theme";
import { OfferData } from "./create-offer";

interface Step2LocationProps {
  data: OfferData;
  updateData: (newData: Partial<OfferData>) => void;
}

export default function Step2Location({
  data,
  updateData,
}: Step2LocationProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>3. Pickup Location</Text>
      {/* Implementation of Map/Address Selector goes here */}
      <Text>Location: {data.location || "Not set"}</Text>
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
});
