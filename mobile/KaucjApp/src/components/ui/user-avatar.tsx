import { colors, shadows, spacing } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";

interface BottleCapAvatarProps {
  imageUrl?: string;
  color?: "primary" | "accent";
}

export default function BottleCapAvatar({
  imageUrl,
  color = "primary",
}: BottleCapAvatarProps) {
  const theme = colors[color] || colors.primary;

  const {
    base: borderColor,
    light: backgroundColor,
    dark: shadowColor,
  } = theme;

  return (
    <View
      style={[styles.capOuter, { borderColor, backgroundColor, shadowColor }]}
    >
      <View style={styles.capInner}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color={borderColor} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  capOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    ...shadows.medium,
    shadowOffset: { width: -4, height: 8 },
    shadowOpacity: 0.3,
  },
  capInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.background.card,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.background.card,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: colors.primary.light,
    justifyContent: "center",
    alignItems: "center",
  },
});
