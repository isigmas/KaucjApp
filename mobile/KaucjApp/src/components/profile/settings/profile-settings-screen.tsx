import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Controller } from "react-hook-form";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  Easing,
} from "react-native-reanimated";

import { useProfileSettingsForm } from "./use-profile-settings";
import { colors, rounded, shadows, spacing } from "@/src/theme";

export default function ProfileSettingsScreen() {
  const { control, errors, onSubmit, isSaveDisabled, isPending, isSuccess } =
    useProfileSettingsForm();
  const { width: windowWidth } = useWindowDimensions();

  const paddingHorizontal = spacing.md;
  const initialWidth = windowWidth - paddingHorizontal * 2;
  const circleSize = 54;

  const animationProgress = useSharedValue(0);

  useEffect(() => {
    if (isSuccess) {
      animationProgress.value = withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      });
    } else {
      animationProgress.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      });
    }
  }, [isSuccess]);

  const animatedButtonStyles = useAnimatedStyle(() => {
    const currentWidth =
      animationProgress.value * (circleSize - initialWidth) + initialWidth;
    const currentRadius =
      animationProgress.value * (circleSize / 2 - rounded.apple) +
      rounded.apple;

    const backgroundColor = interpolateColor(
      animationProgress.value,
      [0, 1],
      [
        isSaveDisabled ? colors.primary.light : colors.primary.base,
        colors.status.success,
      ],
    );

    return {
      width: currentWidth,
      borderRadius: currentRadius,
      backgroundColor: backgroundColor,
    };
  });

  const animatedTextStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isSuccess ? 0 : 1, { duration: 150 }),
    };
  });

  const animatedCheckmarkStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isSuccess ? 1 : 0, { duration: 200 }),
      transform: [
        { scale: withTiming(isSuccess ? 1 : 0.5, { duration: 250 }) },
      ],
    };
  });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DANE OSOBOWE</Text>

        <View style={styles.cardGroup}>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputRow}>
                <Text style={styles.label}>Imię</Text>
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ?? ""}
                  placeholder="Wprowadź imię"
                  placeholderTextColor={colors.text.muted}
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            )}
          />

          <View style={styles.separator} />

          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputRow}>
                <Text style={styles.label}>Nazwisko</Text>
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ?? ""}
                  placeholder="Wprowadź nazwisko"
                  placeholderTextColor={colors.text.muted}
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                />
              </View>
            )}
          />
        </View>

        {(errors.firstName || errors.lastName) && (
          <View style={styles.errorContainer}>
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName.message}</Text>
            )}
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName.message}</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.buttonCenteringContainer}>
        <TouchableOpacity
          onPress={onSubmit}
          disabled={isSaveDisabled}
          activeOpacity={0.85}
        >
          <Animated.View style={[styles.saveButton, animatedButtonStyles]}>
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Animated.Text
                  style={[styles.saveButtonText, animatedTextStyles]}
                >
                  Zapisz zmiany
                </Animated.Text>

                {/*  checkmark  */}
                <Animated.View
                  style={[
                    styles.checkmarkAbsoluteContainer,
                    animatedCheckmarkStyles,
                  ]}
                >
                  <Text style={styles.checkmarkIcon}>✓</Text>
                </Animated.View>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  contentContainer: {
    padding: spacing?.md || 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text?.muted || "#8A8A8E",
    marginBottom: 8,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  cardGroup: {
    backgroundColor: colors.background.card,
    borderRadius: rounded.lg,
    padding: spacing.xs,
    ...shadows.light,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: rounded.apple,
    backgroundColor: colors.background.card,
  },
  label: {
    width: 100,
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    padding: 0,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.status.border,
  },
  errorContainer: {
    marginTop: 8,
    marginLeft: 16,
  },
  errorText: {
    fontSize: 13,
    color: colors.status.error,
    marginTop: 4,
  },

  buttonCenteringContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.medium,
  },
  saveButtonText: {
    color: colors.text.white,
    fontSize: 17,
    fontWeight: "600",
    position: "absolute",
  },
  checkmarkAbsoluteContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkIcon: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
});
