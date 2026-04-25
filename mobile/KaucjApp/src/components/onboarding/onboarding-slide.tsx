import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { OnboardingData } from "@/src/types";

interface Props {
  item: OnboardingData;
}

export const OnboardingSlide = ({ item }: Props) => {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.imageContainer}>
        <Text style={styles.imagePlaceholder}>{item.image}</Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholder: {
    fontSize: 100,
  },
  textContainer: {
    flex: 0.4,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});
