import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/src/theme";

export interface ProgressStep {
  number: number;
  label: string;
}

interface ProgressIndicatorProps {
  steps: readonly ProgressStep[];
  currentStep: number;
  onStepPress: (step: number) => void;
}

export function ProgressIndicator({
  steps,
  currentStep,
  onStepPress,
}: ProgressIndicatorProps) {
  return (
    <View style={styles.progressOuter}>
      {steps.map((step, index) => {
        const isDone = step.number < currentStep;
        const isActive = step.number === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.number}>
            <Pressable
              style={styles.stepNode}
              onPress={() => onStepPress(step.number)}
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

            {!isLast && (
              <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
