import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  BounceIn,
  FadeInDown,
  FadeInUp,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "@/src/theme";

// --- Animated Star Component ---
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface StarProps {
  filled: boolean;
  onPress: () => void;
  size?: number;
}

const InteractiveStar = ({ filled, onPress, size = 40 }: StarProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.8, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    onPress();
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <Ionicons
        name={filled ? "star" : "star-outline"}
        size={size}
        color={filled ? colors.status.warning : colors.status.border}
      />
    </AnimatedPressable>
  );
};

// --- Main Screen ---
export default function ConfirmationScreen() {
  const router = useRouter();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    // TODO: Send the rating and comment to your backend here
    console.log("Submitting review:", { rating, comment });

    // Use replace or dismiss to prevent the user from swiping back to this success screen
    router.replace("/profile/offers"); // Adjust to your actual offers list route
  };

  const handleSkip = () => {
    router.replace("/profile/offers");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Success Animation Section */}
        <View style={styles.headerSection}>
          <Animated.View
            entering={BounceIn.duration(800).delay(100)}
            style={styles.iconContainer}
          >
            <View style={styles.iconBackground}>
              <Ionicons name="checkmark" size={50} color={colors.text.white} />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(600).delay(300).springify()}
            style={styles.textContainer}
          >
            <Text style={styles.title}>Super! Oferta zakończona</Text>
            <Text style={styles.subtitle}>
              Transakcja przebiegła pomyślnie. Środki wkrótce trafią na Twoje
              konto.
            </Text>
          </Animated.View>
        </View>

        {/* 2. Review Section */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(500).springify()}
          layout={Layout.springify()}
          style={styles.reviewCard}
        >
          <Text style={styles.reviewCardTitle}>Jak oceniasz kupującego?</Text>
          <Text style={styles.reviewCardSubtitle}>
            Twoja opinia pomaga budować zaufaną społeczność.
          </Text>

          {/* Interactive Stars */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <InteractiveStar
                key={star}
                filled={star <= rating}
                onPress={() => setRating(star)}
              />
            ))}
          </View>

          {/* Optional Comment Input (Reveals only after they tap a star) */}
          {rating > 0 && (
            <Animated.View
              entering={FadeInDown.springify()}
              style={styles.commentContainer}
            >
              <TextInput
                style={styles.textInput}
                placeholder="Napisz kilka słów (opcjonalnie)..."
                placeholderTextColor={colors.text.muted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={comment}
                onChangeText={setComment}
              />
            </Animated.View>
          )}
        </Animated.View>

        {/* 3. Action Buttons */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(700).springify()}
          style={styles.footer}
        >
          <Pressable
            style={[
              styles.primaryButton,
              rating === 0 && styles.primaryButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={rating === 0}
          >
            <Text
              style={[
                styles.primaryButtonText,
                rating === 0 && styles.primaryButtonTextDisabled,
              ]}
            >
              Wyślij opinię i wróć
            </Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleSkip}>
            <Text style={styles.secondaryButtonText}>
              Pomiń i wróć do ofert
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: "space-between",
  },

  // Header & Icon
  headerSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
    shadowColor: colors.primary.base,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  iconBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary.base,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: colors.primary.light,
    borderStyle: "dashed", // Using the bottle cap motif again to tie the UI together!
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },

  // Review Card
  reviewCard: {
    backgroundColor: colors.background.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.status.border,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    alignItems: "center",
    marginBottom: 40,
  },
  reviewCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 6,
    textAlign: "center",
  },
  reviewCardSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  commentContainer: {
    width: "100%",
    marginTop: 24,
  },
  textInput: {
    backgroundColor: colors.background.subtle,
    borderWidth: 1,
    borderColor: colors.status.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text.primary,
    minHeight: 100,
  },

  // Footer Actions
  footer: {
    gap: 12,
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
  primaryButtonDisabled: {
    backgroundColor: colors.background.subtle,
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  primaryButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  primaryButtonTextDisabled: {
    color: colors.text.muted,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text.secondary,
    fontSize: 15,
    fontWeight: "600",
  },
});
