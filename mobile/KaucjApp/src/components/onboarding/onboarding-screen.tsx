import React, { useRef, useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useAppStore } from "@/src/state/app-store";
import { ONBOARDING_SLIDES } from "@/src/constants";
import { Paginator } from "@/src/components/onboarding/paginator";
import { OnboardingSlide } from "./onboarding-slide";

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
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <Animated.FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          renderItem={({ item }) => <OnboardingSlide item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={scrollHandler}
          scrollEventThrottle={16} //60fps
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
              ? "Get Started"
              : "Next"}
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
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 48,
  },
  button: {
    backgroundColor: "#2563EB", // Brand Blue
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});
