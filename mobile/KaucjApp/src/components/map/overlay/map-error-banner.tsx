import { layoutSpring } from "@/src/constants";
import { colors, rounded, shadows, spacing } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

interface MapErrorBannerProps {
  message: string;
  onRetry: () => void | Promise<unknown>;
  onDismiss?: () => void;
}

function MapErrorBanner({ message, onRetry, onDismiss }: MapErrorBannerProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (isRetrying) return;
    try {
      setIsRetrying(true);
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(18)}
      exiting={FadeOutUp.duration(220)}
      layout={layoutSpring}
      style={styles.card}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name="cloud-offline"
          size={18}
          color={colors.status.warning}
        />
      </View>

      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>

      <Pressable
        onPress={handleRetry}
        disabled={isRetrying}
        accessibilityRole="button"
        accessibilityLabel="Ponów próbę"
        style={({ pressed }) => [
          styles.retryButton,
          pressed && styles.retryButtonPressed,
        ]}
      >
        {isRetrying ? (
          <ActivityIndicator size="small" color={colors.text.white} />
        ) : (
          <>
            <Ionicons name="refresh" size={14} color={colors.text.white} />
            <Text style={styles.retryText}>Ponów</Text>
          </>
        )}
      </Pressable>

      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Zamknij"
          hitSlop={8}
          style={styles.dismissButton}
        >
          <Ionicons name="close" size={16} color={colors.text.muted} />
        </Pressable>
      )}
    </Animated.View>
  );
}

export default React.memo(MapErrorBanner);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.card,
    borderRadius: rounded.apple,
    paddingVertical: spacing.sm + 2,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.status.border,
    ...shadows.light,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF6E6", // soft amber tint, pairs with status.warning
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    lineHeight: 18,
  },
  retryButton: {
    minWidth: 84,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: rounded.pill,
    backgroundColor: colors.primary.base,
  },
  retryButtonPressed: {
    opacity: 0.85,
  },
  retryText: {
    color: colors.text.white,
    fontSize: 13,
    fontWeight: "700",
  },
  dismissButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
