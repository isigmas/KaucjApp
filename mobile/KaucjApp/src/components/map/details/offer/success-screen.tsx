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

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <LottieView source={animation} autoPlay loop style={styles.lottie} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Zarezerwowano!</Text>

          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Twój potencjalny zysk</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
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
              <Text style={styles.totalAmount}>zł</Text>
            </View>
          </View>

          <Text style={styles.description}>
            {"Skontaktuj się z właścicielem,\naby ustalić szczegóły odbioru."}
          </Text>
          <Text
            style={[
              styles.description,
              { marginTop: spacing.sm, fontSize: 16, fontWeight: "300" },
            ]}
          >
            Jeśli tego nie zrobisz, rezerwacja zostanie anulowana po 2
            godzinach.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push("/(app)/(tabs)/profile/bookings")}
          style={styles.button}
        >
          <View style={styles.textStack}>
            <Text style={styles.buttonText}>Moje rezerwacje</Text>
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
    width: "70%",
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

  earningsCard: {
    width: "100%",
    backgroundColor: colors.primary.light,
    borderRadius: rounded.apple,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.md,
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

  description: {
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 23,
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
    backgroundColor: colors.primary.base,
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
