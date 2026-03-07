import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInLeft,
  FadeOutLeft,
  Layout,
} from "react-native-reanimated";
import { colors } from "@/src/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const StepButton = ({
  onPress,
  title,
  variant = "primary",
}: {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary";
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const isPrimary = variant === "primary";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.baseButton,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          isPrimary ? styles.primaryText : styles.secondaryText,
        ]}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
};

// 3. Main Navigation Component
interface StepNavigationProps {
  currentStep: number;
  totalSteps?: number;
  nextStep: () => void;
  prevStep: () => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps = 3,
  nextStep,
  prevStep,
}) => {
  return (
    <View style={styles.container}>
      {/* Clever Animated Progress Dots */}

      {/* Navigation Buttons Row */}
      <View style={styles.buttonRow}>
        {currentStep > 1 ? (
          <Animated.View
            entering={FadeInLeft.springify().damping(15)}
            exiting={FadeOutLeft.springify().damping(15)}
            layout={Layout.springify()}
            style={styles.buttonWrapper}
          >
            <StepButton title="Powrót" variant="secondary" onPress={prevStep} />
          </Animated.View>
        ) : (
          <View
            style={styles.buttonWrapper}
          /> /* Placeholder keeps 'Dalej' aligned right */
        )}

        <Animated.View layout={Layout.springify()} style={styles.buttonWrapper}>
          <StepButton
            title={currentStep === totalSteps ? "Zakończ" : "Dalej"}
            variant="primary"
            onPress={nextStep}
          />
        </Animated.View>
      </View>
    </View>
  );
};

// 4. Styles mapped directly to your palette
const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.status.border,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: colors.status.border,
  },
  activeDot: {
    width: 24, // Expands beautifully with Reanimated Layout
    backgroundColor: colors.primary.base,
  },
  pastDot: {
    backgroundColor: colors.primary.light,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingBottom: 60,
  },
  buttonWrapper: {
    flex: 1, // Ensures buttons are equally sized and responsive
  },
  baseButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  primaryButton: {
    backgroundColor: colors.primary.base,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: colors.background.subtle,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  primaryText: {
    color: colors.text.white,
  },
  secondaryText: {
    color: colors.text.primary,
  },
});
