import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import { colors, rounded, spacing } from "@/src/theme";
import { useLocalSearchParams, useRouter } from "expo-router";

type FlowType = "signUp" | "resetPassword";

export default function EmailSentScreen() {
  const router = useRouter();

  const { email, type = "signUp" } = useLocalSearchParams<{
    email: string;
    type?: FlowType;
  }>();

  const displayEmail = email || "twój e-mail";

  const animation = require("../../../assets/animations/email-sent.json");

  const contentMap = {
    signUp: {
      title: "Potwierdź e-mail",
      description: `Na adres ${displayEmail} wysłano maila z linkiem do potwierdzenia adresu.`,
      buttonText: "Potwierdzono!",
    },
    resetPassword: {
      title: "Sprawdź skrzynkę",
      description: `Na adres ${displayEmail} wysłano maila z linkiem do resetowania hasła.`,
      buttonText: "Wróć do logowania",
    },
  };

  const content = contentMap[type as FlowType] || contentMap.signUp;

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <LottieView source={animation} autoPlay loop style={styles.lottie} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.description}>{content.description}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push("/(auth)/sign-in")}
          style={styles.button}
        >
          <View style={styles.textStack}>
            <Text style={styles.buttonText}>{content.buttonText}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: "80%",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  lottie: {
    width: "80%",
    aspectRatio: 1,
  },
  textContainer: {
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "400",
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 50,
  },
  button: {
    height: 64,
    borderRadius: rounded.apple,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: colors.primary.dark,
  },
  textStack: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
