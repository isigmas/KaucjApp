import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import SwipeButton from "rn-swipe-button";
import { colors } from "@/src/theme";

interface SwipeToReserveProps {
  onComplete: () => void;
  disabled?: boolean;
}

const AnimatedThumbIcon = () => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [slideAnim]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <View style={styles.thumbContent}>
      <Animated.Text
        style={[
          styles.thumbArrow,
          {
            opacity,
            transform: [{ translateX }],
          },
        ]}
      >
        »
      </Animated.Text>
    </View>
  );
};

export default function SwipeToReserve({
  onComplete,
  disabled = false,
}: SwipeToReserveProps) {
  return (
    <View style={[styles.shadowWrapper, disabled && styles.disabledWrapper]}>
      <SwipeButton
        disabled={disabled}
        title="Przesuń, aby zarezerwować"
        onSwipeSuccess={onComplete}
        height={64} // Slightly taller for a more premium feel
        // Title styling
        titleColor={colors.text.primary ?? "#111"} // Darker text for better contrast
        titleStyles={styles.titleStyles}
        // Rail styling (the background track)
        railBackgroundColor={colors.background.subtle ?? "#F3F4F6"}
        railBorderColor={"transparent"} // Removing border makes it look cleaner
        // Fill styling (the active portion behind the thumb)
        railFillBackgroundColor={colors.primary.base}
        railFillBorderColor={colors.primary.base}
        // Thumb styling
        thumbIconComponent={AnimatedThumbIcon}
        thumbIconBackgroundColor={colors.primary.base}
        thumbIconBorderColor={colors.primary.base}
        // Overrides
        shouldResetAfterSuccess={true}
        disableResetOnTap={true}
        // Component styling
        containerStyles={styles.swipeContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    marginVertical: 8,
    borderRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.base,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  disabledWrapper: {
    opacity: 0.6,
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
  swipeContainer: {
    borderRadius: 32,
    overflow: "hidden",
  },
  titleStyles: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  thumbContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  thumbArrow: {
    color: "#fff",
    fontSize: 28, // Larger arrow
    fontWeight: "800",
    lineHeight: 32,
    marginLeft: 2, // Optical alignment for the chevron
  },
});
