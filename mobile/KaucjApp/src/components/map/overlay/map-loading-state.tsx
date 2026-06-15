import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface MapLoadingStateProps {
  title?: string;
  subtitle?: string;
}

export default function MapLoadingState({
  title = "Ustalamy Twoją lokalizację",
  subtitle = "Przygotowujemy mapę w Twojej okolicy",
}: MapLoadingStateProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const pinStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.08]) }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.radar}>
        {RINGS.map((index) => (
          <PingRing key={index} index={index} />
        ))}

        <Animated.View style={[styles.pin, pinStyle]}>
          <Ionicons name="location" size={32} color={colors.text.white} />
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.delay(150).duration(500)}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Animated.View>
    </View>
  );
}

function PingRing({ index }: { index: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      (index * RING_DURATION) / RINGS.length,
      withRepeat(
        withTiming(1, {
          duration: RING_DURATION,
          easing: Easing.out(Easing.cubic),
        }),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(progress);
  }, [index, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.3, 1]) }],
    opacity: interpolate(progress.value, [0, 0.1, 1], [0, 0.35, 0]),
  }));

  return <Animated.View style={[styles.ring, style]} />;
}

const RINGS = [0, 1, 2];
const RING_DURATION = 2800;
const RADAR_SIZE = 200;
const PIN_SIZE = 66;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.main,
    paddingHorizontal: 32,
  },
  radar: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  ring: {
    position: "absolute",
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
    backgroundColor: colors.primary.base,
  },
  pin: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary.base,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
