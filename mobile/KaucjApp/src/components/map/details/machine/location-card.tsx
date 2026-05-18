import React from "react";
import { Text, StyleSheet } from "react-native";
import { OpeningHour } from "@/src/types";
import { colors } from "@/src/theme";
import SectionCard from "../../../ui/section-card";
import CardTitle from "../card-title";
import CurrentOpeningStatus from "./current-opening-status";

interface LocationCardProps {
  address: string;
  openingHours: OpeningHour[];
}

export default function LocationCard({
  address,
  openingHours,
}: LocationCardProps) {
  return (
    <SectionCard>
      <CardTitle>Lokalizacja</CardTitle>
      <Text style={styles.addressText}>{address}</Text>
      <CurrentOpeningStatus openingHours={openingHours} />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  addressText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "500",
  },
});
