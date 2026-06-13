import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Wifi, WifiOff } from "lucide-react-native";
import { useIsOnline } from "@/src/hooks/use-is-online";
import { colors, spacing } from "@/src/theme";

const RECONNECTED_VISIBLE_MS = 2500;

// Global connectivity banner, mounted once in the root layout.
export default function OfflineBanner() {
  const isOnline = useIsOnline();
  const insets = useSafeAreaInsets();
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      setShowReconnected(false);
      return;
    }

    if (wasOffline.current) {
      wasOffline.current = false;
      setShowReconnected(true);
      const timer = setTimeout(
        () => setShowReconnected(false),
        RECONNECTED_VISIBLE_MS,
      );
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (isOnline && !showReconnected) {
    return null;
  }

  const isOffline = !isOnline;

  return (
    <Animated.View
      key={isOffline ? "offline" : "reconnected"}
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(250)}
      pointerEvents="none"
      style={[
        styles.banner,
        { paddingTop: insets.top + spacing.xs },
        isOffline ? styles.offline : styles.reconnected,
      ]}
    >
      {isOffline ? (
        <WifiOff size={14} color={colors.text.white} />
      ) : (
        <Wifi size={14} color={colors.text.white} />
      )}
      <Text style={styles.text}>
        {isOffline ? "Brak połączenia z internetem" : "Połączenie przywrócone"}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs + 2,
    paddingBottom: spacing.sm,
  },
  offline: {
    backgroundColor: colors.text.primary,
  },
  reconnected: {
    backgroundColor: colors.status.success,
  },
  text: {
    color: colors.text.white,
    fontSize: 13,
    fontWeight: "600",
  },
});
