import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors, spacing } from "@/src/theme";

type PasswordChecklistProps = {
  password?: string;
};

export default function PasswordChecklist({
  password = "",
}: PasswordChecklistProps) {
  const rules = [
    { label: "Co najmniej 6 znaków", fulfilled: password.length >= 6 },
    { label: "Wielka litera", fulfilled: /[A-Z]/.test(password) },
    { label: "Mała litera", fulfilled: /[a-z]/.test(password) },
    { label: "Cyfra", fulfilled: /[0-9]/.test(password) },
    { label: "Znak specjalny", fulfilled: /[^a-zA-Z0-9]/.test(password) },
  ];

  return (
    <View style={styles.container}>
      {rules.map((rule, index) => (
        <ChecklistItem key={index} label={rule.label} isMet={rule.fulfilled} />
      ))}
    </View>
  );
}

type ChecklistItemProps = {
  label: string;
  isMet: boolean;
};

const ChecklistItem = ({ label, isMet }: ChecklistItemProps) => {
  const animation = useRef(new Animated.Value(isMet ? 1 : 0)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isMet) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.spring(animation, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isMet]);

  const textColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.text.muted, colors.primary.base],
  });

  const iconColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.text.muted, colors.status.success],
  });

  const iconScale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.4, 1],
  });

  return (
    <View style={styles.ruleRow}>
      <Animated.View style={{ transform: [{ scale: iconScale }] }}>
        <Animated.Text style={{ color: iconColor }}>
          <Feather name={isMet ? "check-circle" : "circle"} size={14} />
        </Animated.Text>
      </Animated.View>

      <Animated.Text style={[styles.ruleText, { color: textColor }]}>
        {label}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
    gap: 6,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ruleText: {
    fontSize: 14,
    marginLeft: 6,
  },
});
