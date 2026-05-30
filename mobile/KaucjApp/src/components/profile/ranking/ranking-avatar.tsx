import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";

interface RankingAvatarProps {
  imageUrl?: string;
  size?: number;
  rank?: number; // 1 = Gold, 2 = Silver, 3 = Bronze, default = standard
}

export default function RankingAvatar({
  imageUrl,
  size = 48,
  rank,
}: RankingAvatarProps) {
  // Determine ring color based on rank
  const getRankColor = () => {
    switch (rank) {
      case 1:
        return "#F59E0B"; // Gold / Amber
      case 2:
        return "#A3ACA7"; // Silver / Muted
      case 3:
        return "#D97757"; // Bronze
      default:
        return colors.primary.base;
    }
  };

  const ringColor = getRankColor();
  const innerSize = size * 0.78; // Proportionate inner cap
  const borderWidth = Math.max(2, size * 0.05); // Scales border dynamically

  return (
    <View
      style={[
        styles.capOuter,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: ringColor,
          borderWidth: borderWidth,
          backgroundColor: rank ? `${ringColor}20` : colors.primary.light,
        },
      ]}
    >
      <View
        style={[
          styles.capInner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <Ionicons name="person" size={innerSize * 0.5} color={ringColor} />
        )}
      </View>

      {/* Crown/Badge overlay for 1st place */}
      {rank === 1 && (
        <View style={styles.crownBadge}>
          <Ionicons name="trophy" size={14} color="#FFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  capOuter: {
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  capInner: {
    backgroundColor: colors.background.card,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.background.card,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  crownBadge: {
    position: "absolute",
    bottom: -6,
    backgroundColor: "#F59E0B",
    padding: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.background.card,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
});
