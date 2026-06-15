import React from "react";
import { Animated, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormProvider } from "react-hook-form";
import { colors, spacing } from "@/src/theme";
import { ProgressIndicator } from "./progress-indicator";
import { SuccessView } from "./success-view";
import LocationBottomSheet from "./location-bottom-sheet";
import Step1Quantity from "./step-1-quantity";
import Step2Location from "./step-2-location";
import Step3Summary from "./step-3-summary";
import { useOfferCreator } from "@/src/hooks/use-offer-creator";
import { ScrollView } from "react-native";
import NavigationButtons from "./navigation-buttons";

export default function CreateOfferScreen() {
  const creator = useOfferCreator();

  if (creator.isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <SuccessView
          onGoHome={creator.goHome}
          onCreateAnother={creator.reset}
        />
      </SafeAreaView>
    );
  }

  return (
    <FormProvider {...creator.form}>
      <SafeAreaView style={styles.container}>
        <ProgressIndicator
          currentStep={creator.currentStep}
          onStepPress={creator.goToStep}
        />
        <ScrollView
          style={styles.animatedWrapper}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
        >
          <Animated.View style={[styles.animatedWrapper, creator.slideStyle]}>
            {creator.currentStep === 1 && <Step1Quantity />}
            {creator.currentStep === 2 && (
              <Step2Location
                selectedLocation={creator.selectedLocation}
                defaultLocation={creator.defaultLocation}
                onOpenLocationPicker={creator.openLocationPicker}
              />
            )}
            {creator.currentStep === 3 && (
              <Step3Summary
                onSubmit={creator.submit}
                isSubmitting={creator.isSubmitting}
              />
            )}
            <NavigationButtons
              currentStep={creator.currentStep}
              onPrevious={creator.previousStep}
              onNext={creator.nextStep}
            />
          </Animated.View>
        </ScrollView>

        {creator.defaultLocation && (
          <LocationBottomSheet
            ref={creator.locationSheetRef}
            selectedLocation={creator.selectedLocation}
            defaultLocation={creator.defaultLocation}
            onConfirm={creator.applyPickedLocation}
          />
        )}
      </SafeAreaView>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  animatedWrapper: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
});
