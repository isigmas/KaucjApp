import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, Dimensions } from "react-native";

const { width: W, height: H } = Dimensions.get("window");
const COLORS = [
  "#5DCAA5",
  "#97C459",
  "#EF9F27",
  "#378ADD",
  "#D4537E",
  "#7F77DD",
];
const COUNT = 60;

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  rotate: Animated.Value;
  color: string;
  size: number;
  isRect: boolean;
}

export default function ConfettiBurst({ active }: { active: boolean }) {
  const particles = useRef<Particle[]>(
    Array.from({ length: COUNT }, () => ({
      x: new Animated.Value(W / 2),
      y: new Animated.Value(H * 0.3),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 7,
      isRect: Math.random() > 0.5,
    })),
  ).current;

  useEffect(() => {
    if (!active) return;

    const animations = particles.map((p) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 220;
      const targetX = W / 2 + Math.cos(angle) * speed;
      const targetY = H * 0.3 + Math.sin(angle) * speed - 60;

      p.x.setValue(W / 2);
      p.y.setValue(H * 0.3);
      p.opacity.setValue(1);
      p.rotate.setValue(0);

      return Animated.parallel([
        Animated.timing(p.x, {
          toValue: targetX,
          duration: 900 + Math.random() * 400,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(p.y, {
            toValue: targetY,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: targetY + 200 + Math.random() * 100,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(p.rotate, {
          toValue: (Math.random() - 0.5) * 8,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(12, animations).start();
  }, [active]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            p.isRect ? styles.rect : styles.circle,
            {
              backgroundColor: p.color,
              width: p.size,
              height: p.isRect ? p.size * 0.5 : p.size,
              borderRadius: p.isRect ? 1 : p.size / 2,
              position: "absolute",
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                {
                  rotate: p.rotate.interpolate({
                    inputRange: [-4, 4],
                    outputRange: ["-720deg", "720deg"],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {},
  rect: {},
});
