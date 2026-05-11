import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  LayoutChangeEvent,
  ActivityIndicator,
  Text,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { colors } from "@/src/theme";

// TO KOMPONENT STWORZONY PRZEZ CLAUDE CODE XD ALE DZIAŁA KOZACKO

export type SliderState = "idle" | "loading" | "success" | "error";

interface SwipeToReserveProps {
  onComplete: () => Promise<void>;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const THUMB_SIZE = 64;
/** How long the success / error state is shown before resetting. */
const FEEDBACK_DURATION_MS = 1000;
/** Fraction of the track the thumb must reach to trigger completion. */
const COMPLETION_THRESHOLD = 0.85;

const THUMB_COLORS: Record<SliderState, string> = {
  idle: colors.primary.base,
  loading: colors.primary.base,
  success: colors.status.success,
  error: colors.status.error,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SwipeToReserve({
  onComplete,
  disabled = false,
}: SwipeToReserveProps) {
  // useState so that thumb icon / color changes actually trigger a re-render.
  const [sliderState, setSliderState] = useState<SliderState>("idle");

  const trackWidth = useRef(0);
  const maxTranslate = useRef(0);

  // Animated values — kept as refs so gesture handlers can read them
  // synchronously without closing over stale state.
  const translateX = useRef(new Animated.Value(0)).current;
  const fillWidth = useRef(new Animated.Value(THUMB_SIZE)).current;
  const labelOpacity = useRef(new Animated.Value(1)).current;
  const thumbColorAnim = useRef(new Animated.Value(0)).current; // 0 = primary, 1 = feedback

  // JS-side mirror of translateX for threshold checks inside gesture handlers.
  const currentX = useRef(0);
  useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      currentX.current = value;
    });
    return () => translateX.removeListener(id);
  }, [translateX]);

  // Guard so onUpdate / onEnd are no-ops once the swipe is committed.
  const isLocked = useRef(false);

  // ------------------------------------------------------------------
  // Animations
  // ------------------------------------------------------------------

  const animateToEnd = useCallback(() => {
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
    ]).start();
  }, [translateX, fillWidth]);

  const animateReset = useCallback(
    (onDone?: () => void) => {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }),
        Animated.timing(fillWidth, {
          toValue: THUMB_SIZE,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(labelOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        currentX.current = 0;
        onDone?.();
      });
    },
    [translateX, fillWidth, labelOpacity],
  );

  // ------------------------------------------------------------------
  // Swipe completion handler
  // ------------------------------------------------------------------

  const handleSwipeComplete = useCallback(async () => {
    isLocked.current = true;
    animateToEnd();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSliderState("loading");

    try {
      await onComplete();

      setSliderState("success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        animateReset(() => {
          setSliderState("idle");
          isLocked.current = false;
        });
      }, FEEDBACK_DURATION_MS);
    } catch {
      // onComplete is responsible for surfacing the error to the UI above.
      // The slider just resets cleanly after showing brief error feedback.
      setSliderState("error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      setTimeout(() => {
        animateReset(() => {
          setSliderState("idle");
          isLocked.current = false;
        });
      }, FEEDBACK_DURATION_MS);
    }
  }, [onComplete, animateToEnd, animateReset]);

  // ------------------------------------------------------------------
  // Layout
  // ------------------------------------------------------------------

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
    maxTranslate.current = trackWidth.current - THUMB_SIZE;
  }, []);

  // ------------------------------------------------------------------
  // Gesture
  // ------------------------------------------------------------------

  const isDisabled = disabled || sliderState !== "idle";

  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(!isDisabled)
    // Only activates on clear horizontal intent — prevents the bottom sheet's
    // vertical pan handler from racing with the thumb drag.
    .activeOffsetX([-6, 6])
    .failOffsetY([-8, 8])
    .onUpdate((e) => {
      if (isLocked.current) return;
      const next = Math.max(0, Math.min(e.translationX, maxTranslate.current));
      translateX.setValue(next);
      fillWidth.setValue(THUMB_SIZE + next);
      labelOpacity.setValue(1 - next / (maxTranslate.current * 0.6));
    })
    .onEnd(() => {
      if (isLocked.current) return;
      if (currentX.current >= maxTranslate.current * COMPLETION_THRESHOLD) {
        handleSwipeComplete();
      } else {
        Haptics.selectionAsync();
        animateReset();
      }
    });

  // ------------------------------------------------------------------
  // Idle arrow pulse
  // ------------------------------------------------------------------

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

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  const thumbBg = THUMB_COLORS[sliderState];

  return (
    <View
      style={[styles.wrapper, isDisabled && styles.wrapperDisabled]}
      onLayout={onLayout}
    >
      {/* Fill bar */}
      <Animated.View
        style={[styles.fill, { width: fillWidth, backgroundColor: thumbBg }]}
      />

      {/* Idle label — fades out as the thumb advances */}
      <Animated.Text style={[styles.label, { opacity: labelOpacity }]}>
        Przesuń, aby zarezerwować
      </Animated.Text>

      {/* Draggable thumb */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.thumb,
            { backgroundColor: thumbBg, transform: [{ translateX }] },
          ]}
        >
          <ThumbContent
            state={sliderState}
            arrowOpacity={arrowOpacity}
            arrowTranslateX={arrowTranslateX}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ThumbContent — isolated so the parent never re-renders just for icon changes
// ---------------------------------------------------------------------------

interface ThumbContentProps {
  state: SliderState;
  arrowOpacity: Animated.AnimatedInterpolation<number>;
  arrowTranslateX: Animated.AnimatedInterpolation<number>;
}

function ThumbContent({
  state,
  arrowOpacity,
  arrowTranslateX,
}: ThumbContentProps) {
  if (state === "loading") {
    return <ActivityIndicator color="#fff" size="small" />;
  }
  if (state === "success") {
    return <Text style={styles.thumbIcon}>✓</Text>;
  }
  if (state === "error") {
    return <Text style={styles.thumbIcon}>✕</Text>;
  }
  return (
    <Animated.Text
      style={[
        styles.arrow,
        { opacity: arrowOpacity, transform: [{ translateX: arrowTranslateX }] },
      ]}
    >
      »
    </Animated.Text>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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
    opacity: 0.6,
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    right: undefined,
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
  thumbIcon: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
});
