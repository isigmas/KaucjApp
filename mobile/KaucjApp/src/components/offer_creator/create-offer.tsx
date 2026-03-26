import { colors } from "@/src/theme";
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Step1Quantity from "./step-1-quantity";
import Step2Location from "./step-2-location";
import Step3Summary from "./step-3-summary";

export interface OfferData {
  plasticBottles: number;
  glassBottles: number;
  cans: number;
  latitude: number | null;
  longitude: number | null;
  plasticPrice: number;
  glassPrice: number;
  cansPrice: number;
  address: string;
  notes?: string;
}
const STEPS = [
  { number: 1, label: "Ilość i cena" },
  { number: 2, label: "Adres" },
  { number: 3, label: "Podgląd" },
];

const triggerSlideInAnimation = (animatedValue: Animated.Value) => {
  animatedValue.setValue(0);

  Animated.spring(animatedValue, {
    toValue: 1,
    friction: 9,
    tension: 60, //  speed
    useNativeDriver: true,
  }).start();
};

/**
 * Generates the animated styles based on the animated value.
 */
const getSlideInStyles = (animatedValue: Animated.Value) => {
  return {
    opacity: animatedValue,
    transform: [
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  };
};

export default function CreateOfferScreen() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [offerData, setOfferData] = useState<OfferData>({
    plasticBottles: 10,
    glassBottles: 0,
    cans: 0,
    plasticPrice: 0.2,
    glassPrice: 0.5,
    cansPrice: 0.2,
    address: "",
    notes: "",
    latitude: null,
    longitude: null,
  });

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Run the independent animation function every time the step changes
  useEffect(() => {
    triggerSlideInAnimation(slideAnim);
  }, [currentStep, slideAnim]);

  const handleUpdateData = (newData: Partial<OfferData>) => {
    setOfferData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Dynamic component rendering
  const renderStep = () => {
    const props = {
      data: offerData,
      updateData: handleUpdateData,
      onNext: nextStep,
      onBack: prevStep,
    };

    switch (currentStep) {
      case 1:
        return <Step1Quantity {...props} />;
      case 2:
        return <Step2Location {...props} />;
      case 3:
        return <Step3Summary {...props} />;

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressOuter}>
        {STEPS.map((step) => {
          const isDone = step.number < currentStep;
          const isActive = step.number === currentStep;
          return (
            <React.Fragment key={step.number}>
              <Pressable
                style={styles.stepNode}
                onPress={() => setCurrentStep(step.number)}
              >
                <View
                  style={[
                    styles.stepDot,
                    isActive && styles.stepDotActive,
                    isDone && styles.stepDotDone,
                  ]}
                >
                  {isDone ? (
                    <Text style={styles.stepDotCheck}>✓</Text>
                  ) : (
                    <Text
                      style={[
                        styles.stepDotNumber,
                        isActive && styles.stepDotNumberActive,
                      ]}
                    >
                      {step.number}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isActive && styles.stepLabelActive,
                    isDone && styles.stepLabelDone,
                  ]}
                >
                  {step.label}
                </Text>
              </Pressable>
              {step.number < STEPS.length && (
                <View
                  style={[styles.stepLine, isDone && styles.stepLineDone]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Animated Step Container */}
      <Animated.View
        style={[styles.animatedWrapper, getSlideInStyles(slideAnim)]}
      >
        {renderStep()}
      </Animated.View>

      {/* navigatoin */}
      {/* <StepNavigation
        currentStep={currentStep}
        totalSteps={3}
        nextStep={nextStep}
        prevStep={prevStep}
      /> */}
    </SafeAreaView>
  );
}

// --- 5. Skeleton Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },

  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text.primary,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 3,
    fontWeight: "500",
  },
  // prgoress bar
  progressOuter: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 28,
    marginBottom: 20,
    marginTop: 45,
  },
  stepNode: {
    alignItems: "center",
    gap: 5,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background.subtle,
    borderWidth: 1.5,
    borderColor: colors.status.border,
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: colors.primary.base,
    borderColor: colors.primary.base,
    shadowColor: colors.primary.base,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  stepDotDone: {
    backgroundColor: colors.primary.dark,
    borderColor: colors.primary.dark,
  },
  stepDotNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.muted,
  },
  stepDotNumberActive: {
    color: colors.text.white,
  },
  stepDotCheck: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text.white,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    textAlign: "center",
    maxWidth: 64,
  },
  stepLabelActive: {
    color: colors.primary.base,
  },
  stepLabelDone: {
    color: colors.primary.dark,
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.status.border,
    marginHorizontal: 6,
    marginTop: 14,
  },
  stepLineDone: {
    backgroundColor: colors.primary.dark,
  },

  animatedWrapper: {
    flex: 1,
    paddingHorizontal: 24,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
    width: 1 / 2,
  },
  buttonPlaceholder: {
    width: 1 / 2,
  },
  buttonSecondary: {
    backgroundColor: "#E5E7EB",
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  publishButton: { backgroundColor: "#047857" },
  buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  buttonTextSecondary: { color: "#111827", fontWeight: "700", fontSize: 16 },
  summaryBox: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
