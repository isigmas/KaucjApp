import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  LayoutChangeEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { colors } from "@/src/theme";

interface SwipeToReserveProps {
  onComplete: () => void;
  disabled?: boolean;
}

const THUMB_SIZE = 64;
const RESET_DELAY_MS = 400;

export default function SwipeToReserve({
  onComplete,
  disabled = false,
}: SwipeToReserveProps) {
  const trackWidth = useRef(0);
  const maxTranslate = useRef(0);

  // Shared values via plain Animated — keeps this compatible with
  // projects that haven't enabled the new architecture / Reanimated.
  const translateX = useRef(new Animated.Value(0)).current;
  const fillWidth = useRef(new Animated.Value(THUMB_SIZE)).current;
  const thumbScale = useRef(new Animated.Value(1)).current;
  const labelOpacity = useRef(new Animated.Value(1)).current;

  // Track the raw JS-side position so the pan gesture can read it.
  const currentX = useRef(0);
  useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      currentX.current = value;
    });
    return () => translateX.removeListener(id);
  }, [translateX]);

  const reset = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
      }),
      Animated.timing(fillWidth, {
        toValue: THUMB_SIZE,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(thumbScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      currentX.current = 0;
    });
  }, [translateX, fillWidth, thumbScale, labelOpacity]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
    maxTranslate.current = trackWidth.current - THUMB_SIZE;
  }, []);

  // Built on Gesture.Pan() — lives entirely inside the RNGH arena and can
  // declare priority over the bottom-sheet's pan handler via activateAfterLongPress
  // / simultaneousWithExternalGesture without any PanResponder conflicts.
  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(!disabled)
    // Only activate on clear horizontal intent — this alone prevents the
    // bottom sheet's vertical pan from racing with the thumb drag.
    .activeOffsetX([-6, 6])
    .failOffsetY([-8, 8])
    .onUpdate((e) => {
      const next = Math.max(0, Math.min(e.translationX, maxTranslate.current));
      translateX.setValue(next);
      fillWidth.setValue(THUMB_SIZE + next);
      labelOpacity.setValue(1 - next / (maxTranslate.current * 0.6));
    })
    .onEnd((e) => {
      const threshold = maxTranslate.current * 0.85;
      if (currentX.current >= threshold) {
        // Snap to end, fire callback, then reset.
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: maxTranslate.current,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(fillWidth, {
            toValue: trackWidth.current,
            duration: 120,
            useNativeDriver: false,
          }),
        ]).start(() => {
          onComplete();
          setTimeout(reset, RESET_DELAY_MS);
        });
      } else {
        reset();
      }
    });

  // Pulse animation for the arrow icon
  const pulseAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const arrowTranslateX = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });
  const arrowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <View
      style={[styles.wrapper, disabled && styles.wrapperDisabled]}
      onLayout={onLayout}
    >
      {/* Fill bar */}
      <Animated.View style={[styles.fill, { width: fillWidth }]} />

      {/* Label */}
      <Animated.Text style={[styles.label, { opacity: labelOpacity }]}>
        Przesuń, aby zarezerwować
      </Animated.Text>

      {/* Draggable thumb */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX }, { scale: thumbScale }],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.arrow,
              {
                opacity: arrowOpacity,
                transform: [{ translateX: arrowTranslateX }],
              },
            ]}
          >
            »
          </Animated.Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.background.subtle,
    justifyContent: "center",
    overflow: "hidden",
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.base,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  wrapperDisabled: {
    opacity: 1,
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    right: undefined,
    backgroundColor: colors.primary.base,
    borderRadius: THUMB_SIZE / 2,
    opacity: 0.6,
  },
  label: {
    position: "absolute",
    alignSelf: "center",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: colors.text.primary,
    marginLeft: THUMB_SIZE * 0.5,
  },
  thumb: {
    position: "absolute",
    left: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.primary.base,
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
    marginLeft: 2,
  },
});
