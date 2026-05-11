import { colors, rounded, spacing } from "@/src/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import SectionTitle from "../card-title";
import SectionCard from "../section-card";
import MiniMap from "@/src/components/profile/reserved-offers/mini-map";

interface PickupCardProps {
  address: string;
  instructions?: string | null;
  /**
   * When true, renders only the address/instructions block without a
   * SectionCard wrapper or title.
   */
  bare?: boolean;
  showMap?: boolean;
  latitude?: number;
  longitude?: number;
}

export default function PickupCard({
  address,
  instructions,
  bare = false,
  showMap = false,
  latitude,
  longitude,
}: PickupCardProps) {
  const body = (
    <>
      <Text style={styles.primaryText}>{address}</Text>
      {instructions ? (
        <View style={styles.instructionBox}>
          <Text style={styles.instructionLabel}>Instrukcje</Text>
          <Text style={styles.secondaryText}>{instructions}</Text>
        </View>
      ) : null}
      {showMap && latitude && longitude ? (
        <View style={styles.mapContainer}>
          <MiniMap
            interactive
            latitude={latitude}
            longitude={longitude}
            height={180}
          />
        </View>
      ) : null}
    </>
  );

  if (bare) return <View>{body}</View>;

  return (
    <SectionCard>
      <SectionTitle>Adres odbioru</SectionTitle>
      {body}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  primaryText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "500",
    lineHeight: 22,
  },
  secondaryText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 20,
  },
  instructionBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.status.border,
  },
  instructionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  mapContainer: {
    marginTop: spacing.sm,
  },
});
