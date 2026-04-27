import React from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";
import { colors, spacing } from "@/src/theme";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  imageShown?: boolean;
}

export function AuthHeader({
  title,
  subtitle,
  imageShown = true,
}: AuthHeaderProps) {
  const imageSource = require("../../../assets/images/kaucjapp-logo.png");

  return (
    <View style={styles.container}>
      {imageShown && (
        <View style={styles.imageShadowWrapper}>
          <Image source={imageSource} style={styles.image} />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },

  imageShadowWrapper: {
    width: 200,
    height: 200,
    marginBottom: spacing.md,
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 44,
    borderCurve: "continuous",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
    borderCurve: "continuous",
    overflow: "hidden",
  },

  title: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
  },
});
