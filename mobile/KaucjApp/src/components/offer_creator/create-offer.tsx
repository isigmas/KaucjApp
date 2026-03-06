import { colors } from "@/src/theme";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Step1Quantity from "./step-1-quantity";
import Step2Price from "./step-2-price";
import Step3Location from "./step-3-location";
import Step4Summary from "./step-4-summary";

export interface OfferData {
  bottles: number;
  cans: number;
  askingPrice: number;
  location: string;
}

const triggerSlideInAnimation = (animatedValue: Animated.Value) => {
  // Reset to initial state (off-screen right and slightly transparent)
  animatedValue.setValue(0);

  Animated.spring(animatedValue, {
    toValue: 1,
    friction: 9, // Higher friction = less bounce
    tension: 60, // Higher tension = faster speed
    useNativeDriver: true, // Crucial for 60fps performance
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
    bottles: 10,
    cans: 0,
    askingPrice: 0,
    location: "",
  });

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Run the independent animation function every time the step changes
  useEffect(() => {
    triggerSlideInAnimation(slideAnim);
  }, [currentStep, slideAnim]);

  const handleUpdateData = (newData: Partial<OfferData>) => {
    setOfferData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
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
        return <Step2Price {...props} />;
      case 3:
        return <Step3Location {...props} />;
      case 4:
        return <Step4Summary {...props} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Step {currentStep} of 4</Text>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: `${(currentStep / 4) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Animated Step Container */}
      <Animated.View
        style={[styles.animatedWrapper, getSlideInStyles(slideAnim)]}
      >
        {renderStep()}
      </Animated.View>
      <View style={styles.row}>
        <Pressable style={styles.buttonSecondary} onPress={prevStep}>
          <Text style={styles.buttonTextSecondary}>Back</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={nextStep}>
          <Text style={styles.buttonText}>Next: Summary</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// --- 5. Skeleton Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  progressContainer: { padding: 20 },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "600",
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 3,
  },
  animatedWrapper: { flex: 1, padding: 20 },
  stepContainer: { flex: 1 },
  stepTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
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
