import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { Easing } from "react-native-reanimated";
import { Offer } from "@/src/types";
import { colors, rounded, spacing } from "@/src/theme";
import ConfettiBurst from "./confetti-burst";
import AnimatedRollingNumber from "react-native-animated-rolling-numbers";
import { useRouter } from "expo-router";

interface ReservationSuccessProps {
  offer: Offer;
  onDone: () => void;
}

export default function ReservationSuccess({
  offer,
  onDone,
}: ReservationSuccessProps) {
  const router = useRouter();

  const scale = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 160,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideY, {
        toValue: 0,
        tension: 120,
        friction: 12,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      <ConfettiBurst active />

      <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
        <Text style={styles.checkmark}>✓</Text>
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateY: slideY }],
          alignItems: "center",
          width: "100%",
          flex: 1,
        }}
      >
        <Text style={styles.headline}>Zarezerwowano!</Text>
        <Text style={styles.sub}>Oferta czeka na ciebie. Czas ruszać!</Text>

        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Twój potencjalny zysk</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <AnimatedRollingNumber
              value={offer.totalIncome}
              toFixed={2}
              useGrouping={true}
              textStyle={styles.totalAmount}
              spinningAnimationConfig={{
                duration: 500,
                easing: Easing.bounce,
              }}
            />
            <Text style={styles.totalAmount}>zł</Text>
          </View>
          <Text style={styles.earningsCaption}>za tę dostawę</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.doneBtn,
            pressed && styles.doneBtnPressed,
            { marginTop: "auto" }, //
          ]}
          onPress={onDone}
        >
          <Text style={styles.doneBtnText}>Przejdź do rezerwacji</Text>
        </Pressable>

        <Pressable
          style={styles.backToMapBtn}
          onPress={() => router.push("/(app)/(tabs)/home")}
        >
          <Text style={styles.backToMapBtnText}>Powrót do mapy</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.status.success ?? "#EAF3DE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#C0DD97",
  },
  checkmark: {
    fontSize: 36,
    color: "#3B6D11",
    fontWeight: "700",
  },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  sub: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  earningsCard: {
    width: "100%",
    backgroundColor: colors.primary.light,
    borderRadius: rounded.xl,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "#C0DD97",
  },
  earningsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3B6D11",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  earningsAmount: {
    fontSize: 40,
    fontWeight: "700",
    color: "#27500A",
    lineHeight: 48,
  },
  earningsCaption: {
    fontSize: 13,
    color: "#3B6D11",
    marginTop: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primary.dark,
  },
  pills: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  doneBtn: {
    width: "100%",
    height: 54,
    backgroundColor: colors.primary.base,
    borderRadius: rounded.apple,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnPressed: {
    backgroundColor: colors.primary.dark,
    transform: [{ scale: 0.98 }],
  },
  doneBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },

  backToMapBtn: {
    marginTop: spacing.sm,
    width: "100%",
    height: 54,
    borderWidth: 2,
    borderColor: colors.primary.base,
    borderRadius: rounded.apple,
    alignItems: "center",
    justifyContent: "center",
  },
  backToMapBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary.dark,
  },
});
