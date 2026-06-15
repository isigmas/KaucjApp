import React from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  BounceIn,
  FadeInDown,
  FadeInUp,
  Layout,
} from "react-native-reanimated";
import { colors, spacing } from "@/src/theme";
import ConfirmationCheck from "../ui/confirmation-check";

const { width } = Dimensions.get("window");

interface SuccessViewProps {
  onGoHome: () => void;
  onCreateAnother: () => void;
}

export function SuccessView({ onGoHome, onCreateAnother }: SuccessViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ConfirmationCheck />

        <Animated.View
          entering={FadeInDown.duration(600).delay(400).springify()}
          style={styles.textContainer}
        >
          <Text style={styles.title}>Oferta dodana!</Text>
          <Text style={styles.subtitle}>
            Twoja oferta kaucji została pomyślnie opublikowana. Kurierzy w
            Twojej okolicy mogą ją teraz zobaczyć i zarezerwować odbiór.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(600).delay(700).springify()}
          layout={Layout.springify()}
          style={styles.actions}
        >
          <Pressable style={styles.primaryButton} onPress={onGoHome}>
            <Text style={styles.primaryButtonText}>Wróć na stronę główną</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onCreateAnother}>
            <Text style={styles.secondaryButtonText}>Dodaj kolejną ofertę</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: width * 0.8,
  },
  actions: {
    marginTop: 20,
    width: "100%",
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary.base,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: colors.background.card,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.status.border,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
