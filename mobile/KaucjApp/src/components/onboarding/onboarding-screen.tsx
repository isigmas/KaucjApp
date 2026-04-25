import React, { useRef, useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAppStore } from "@/src/state/app-store";
import { ONBOARDING_SLIDES } from "@/src/constants";
import { OnboardingSlide } from "@/src/components/onboarding/onboarding-slide";
import { Paginator } from "@/src/components/onboarding/paginator";

export default function OnboardingScreen() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollX = useSharedValue(0);
  const flatListRef = useRef<Animated.FlatList<any>>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await completeOnboarding();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <Animated.FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          renderItem={({ item, index }) => (
            <OnboardingSlide item={item} index={index} scrollX={scrollX} />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfig}
        />
      </View>

      <View style={styles.footer}>
        <Paginator data={ONBOARDING_SLIDES} scrollX={scrollX} />

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>
            {currentIndex === ONBOARDING_SLIDES.length - 1
              ? "Start Building"
              : "Continue"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  sliderContainer: {
    flex: 3,
  },
  footer: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
    paddingBottom: 50,
  },
  button: {
    backgroundColor: "#0F172A", // Dark, premium slate button
    paddingVertical: 20,
    borderRadius: 20, // More rounded, modern feel
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }], // Slight shrink on press
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
