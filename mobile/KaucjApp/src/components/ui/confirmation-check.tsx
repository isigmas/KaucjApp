import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import React from "react";
import Animated, { BounceIn } from "react-native-reanimated";
import { colors, rounded, shadows } from "@/src/theme";

export default function ConfirmationCheck({
  style,
}: {
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View
      entering={BounceIn.duration(800).delay(100)}
      style={styles.iconContainer}
    >
      <View style={[styles.iconBackground, style]}>
        <Text style={styles.iconText}>✓</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    marginBottom: 32,
    ...shadows.medium,
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: rounded.pill,
    backgroundColor: colors.primary.base,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 48,
    color: colors.text.white,
    fontWeight: "900",
  },
});
