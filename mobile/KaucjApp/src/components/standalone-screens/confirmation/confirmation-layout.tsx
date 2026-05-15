import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import LottieView from "lottie-react-native";
import { colors, rounded, spacing } from "@/src/theme";

export interface ActionConfirmationLayoutProps {
  animationSource: any;
  title: string;
  description?: string;
  buttonText: string;
  onButtonPress: () => void;
  warningText?: string;
  children?: React.ReactNode;
}

export default function ActionConfirmationLayout({
  animationSource,
  title,
  description,
  buttonText,
  onButtonPress,
  warningText,
  children,
}: ActionConfirmationLayoutProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.imageContainer}>
          <LottieView
            source={animationSource}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>

          {description && <Text style={styles.description}>{description}</Text>}

          {/* Slot for custom cards */}
          {children && <View style={styles.childrenWrapper}>{children}</View>}

          {warningText && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>{warningText}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={onButtonPress}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl,
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
    marginBottom: spacing.lg,
  },
  childrenWrapper: {
    width: "100%",
    marginBottom: spacing.lg,
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
    paddingTop: 16,
    backgroundColor: colors.background.main,
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
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
