import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import { colors, rounded, spacing } from "@/src/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Easing } from "react-native-reanimated";
import AnimatedRollingNumber from "react-native-animated-rolling-numbers";

export default function EmailSentScreen() {
  const params = useLocalSearchParams<{ totalIncome: string }>();
  const totalIncome = parseFloat(params.totalIncome) || 0;
  const router = useRouter();

  const animation = require("@/assets/animations/email-sent.json");

  const handleDone = () => {
    console.log("handleDone");

    router.dismissTo("/(app)/(tabs)/home");
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <LottieView source={animation} autoPlay loop style={styles.lottie} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Zarezerwowano!</Text>

          {/* Karta z zyskiem - ulepszony wygląd */}
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Twój potencjalny zysk</Text>
            <View style={styles.amountWrapper}>
              <AnimatedRollingNumber
                value={totalIncome}
                toFixed={2}
                useGrouping={true}
                textStyle={styles.totalAmount}
                spinningAnimationConfig={{
                  duration: 500,
                  easing: Easing.bounce,
                }}
              />
              <Text style={styles.totalAmountCurrency}> zł</Text>
            </View>
          </View>

          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              {`Jeśli nie skontaktujesz się z właścicielem, rezerwacja zostanie anulowana 
po 2 godzinach.`}
            </Text>
          </View>
        </View>
      </View>

      {/* Przycisk na samym dole */}
      <View style={styles.footer}>
        <Pressable onPress={handleDone} style={styles.button}>
          <Text style={styles.buttonText}>Klasa!</Text>
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
    width: "100%",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  lottie: {
    width: "60%",
    aspectRatio: 1,
  },
  textContainer: {
    width: "100%",
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
    marginBottom: spacing.md,
  },

  /* --- Karta Zysków --- */
  earningsCard: {
    width: "100%",
    backgroundColor: colors.background.card,
    borderRadius: rounded.apple,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent.light,
    shadowColor: colors.black.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  earningsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent.dark,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  amountWrapper: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.primary.dark,
  },
  totalAmountCurrency: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary.dark,
  },

  warningContainer: {
    backgroundColor: `${colors.status.warning}15`,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: rounded.apple,
    width: "100%",
  },
  warningText: {
    fontSize: 14,
    color: colors.status.warning,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "600",
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
    backgroundColor: colors.primary.base,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
