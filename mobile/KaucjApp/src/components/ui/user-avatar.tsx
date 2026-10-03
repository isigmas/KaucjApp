import { colors, shadows, spacing } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

interface BottleCapAvatarProps {
  imageUrl?: string | null;
  color?: "primary" | "accent";
  /** Shows a camera badge and makes the avatar tappable. */
  onPress?: () => void;
  /** Dims the picture and shows a spinner (e.g. while uploading). */
  isLoading?: boolean;
}

export default function BottleCapAvatar({
  imageUrl,
  color = "primary",
  onPress,
  isLoading = false,
}: BottleCapAvatarProps) {
  const theme = colors[color] || colors.primary;

  const {
    base: borderColor,
    light: backgroundColor,
    dark: shadowColor,
  } = theme;

  const cap = (
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
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </View>

      {onPress && (
        <View
          style={[styles.editBadge, { backgroundColor: borderColor }]}
          pointerEvents="none"
        >
          <Ionicons name="camera" size={14} color="#fff" />
        </View>
      )}
    </View>
  );

  if (!onPress) return cap;

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel="Zmień zdjęcie profilowe"
      hitSlop={8}
    >
      {cap}
    </Pressable>
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    right: -6,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
