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
import { OnboardingButton } from "./onboarding-button";
import { colors, spacing } from "@/src/theme";

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

        <OnboardingButton
          onPress={handleNext}
          scrollX={scrollX}
          totalSlides={ONBOARDING_SLIDES.length}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  sliderContainer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 32,
    justifyContent: "flex-end",
    paddingBottom: 50,
    gap: spacing.lg,
  },
});
