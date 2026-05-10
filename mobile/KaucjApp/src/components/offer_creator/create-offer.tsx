import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { colors } from "@/src/theme";
import { useCreateOffer } from "@/src/api/hooks/use-offer";
import {
  buildOfferPayload,
  defaultOfferFormValues,
  offerFormSchema,
  type OfferFormValues,
} from "./offer-form-schema";
import {
  ProgressIndicator,
  type ProgressStep,
} from "./progress-indicator";
import { SuccessView } from "./success-view";
import {
  LocationBottomSheet,
  type LocationBottomSheetRef,
  type PickedLocation,
} from "./location-bottom-sheet";
import Step1Quantity from "./step-1-quantity";
import Step2Location from "./step-2-location";
import Step3Summary from "./step-3-summary";

const STEPS = [
  { number: 1, label: "Ilość i cena" },
  { number: 2, label: "Adres" },
  { number: 3, label: "Podgląd" },
] as const satisfies readonly ProgressStep[];

const TOTAL_STEPS = STEPS.length;
const FIRST_STEP = STEPS[0].number;

/**
 * Top-level orchestrator of the offer creator flow.
 *
 * Responsibilities:
 *  - Owns the multi-step form state via `react-hook-form` + `zod`.
 *  - Tracks the active step and the success view.
 *  - Hosts the location-picker bottom sheet and the create-offer mutation.
 *
 * Step components consume the form via `useFormContext`, which keeps the
 * parent free of per-field prop drilling.
 */
export default function CreateOfferScreen() {
  const router = useRouter();
  const { mutate: createOffer, isPending } = useCreateOffer();

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: defaultOfferFormValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const [currentStep, setCurrentStep] = useState<number>(FIRST_STEP);
  const [isSuccess, setIsSuccess] = useState(false);

  const locationSheetRef = useRef<LocationBottomSheetRef>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSuccess) return;
    runSlideInAnimation(slideAnim);
  }, [currentStep, isSuccess, slideAnim]);

  const handleStepPress = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const handleOpenLocationPicker = useCallback(() => {
    const { latitude, longitude } = form.getValues();
    const initial: PickedLocation | null =
      latitude !== null && longitude !== null
        ? { latitude, longitude }
        : null;

    locationSheetRef.current?.open(initial);
  }, [form]);

  const handleLocationConfirmed = useCallback(
    (location: PickedLocation) => {
      form.setValue("latitude", location.latitude, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue("longitude", location.longitude, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form],
  );

  const handlePublish = useMemo(
    () =>
      form.handleSubmit(
        (values) => {
          createOffer(buildOfferPayload(values), {
            onSuccess: () => setIsSuccess(true),
            onError: (error) => {
              const message =
                error.response?.data?.message ??
                "Nie udało się opublikować oferty. Spróbuj ponownie.";
              Alert.alert("Błąd", message);
            },
          });
        },
        (errors) => {
          // Surface the first blocking issue and route the user to the step
          // where it can be fixed.
          const firstMessage = collectFirstErrorMessage(errors);
          if (firstMessage) {
            Alert.alert("Sprawdź formularz", firstMessage);
          }

          if (errors.plasticBottles || errors.cans) {
            setCurrentStep(1);
          } else if (
            errors.latitude ||
            errors.longitude ||
            errors.pickupAddress
          ) {
            setCurrentStep(2);
          }
        },
      ),
    [createOffer, form],
  );

  const handleGoHome = useCallback(() => {
    setIsSuccess(false);
    form.reset(defaultOfferFormValues);
    setCurrentStep(FIRST_STEP);
    router.navigate("/(app)/(tabs)/home");
  }, [form, router]);

  const handleCreateAnother = useCallback(() => {
    form.reset(defaultOfferFormValues);
    setCurrentStep(FIRST_STEP);
    setIsSuccess(false);
  }, [form]);

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <SuccessView
          onGoHome={handleGoHome}
          onCreateAnother={handleCreateAnother}
        />
      </SafeAreaView>
    );
  }

  return (
    <FormProvider {...form}>
      <SafeAreaView style={styles.container}>
        <ProgressIndicator
          steps={STEPS}
          currentStep={currentStep}
          onStepPress={handleStepPress}
        />

        <Animated.View
          style={[styles.animatedWrapper, getSlideInStyles(slideAnim)]}
        >
          {currentStep === 1 && <Step1Quantity />}
          {currentStep === 2 && (
            <Step2Location onOpenLocationPicker={handleOpenLocationPicker} />
          )}
          {currentStep === TOTAL_STEPS && (
            <Step3Summary
              onSubmit={handlePublish}
              isSubmitting={isPending}
            />
          )}
        </Animated.View>

        <LocationBottomSheet
          ref={locationSheetRef}
          onConfirm={handleLocationConfirmed}
        />
      </SafeAreaView>
    </FormProvider>
  );
}

const runSlideInAnimation = (animatedValue: Animated.Value) => {
  animatedValue.setValue(0);
  Animated.spring(animatedValue, {
    toValue: 1,
    friction: 9,
    tension: 60,
    useNativeDriver: true,
  }).start();
};

const getSlideInStyles = (animatedValue: Animated.Value) => ({
  opacity: animatedValue,
  transform: [
    {
      translateX: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0],
      }),
    },
  ],
});

/**
 * Walks a react-hook-form `errors` tree depth-first and returns the first
 * human-readable message found. Used to surface a single relevant error to
 * the user when they hit "Opublikuj" with an invalid form.
 */
const collectFirstErrorMessage = (errors: unknown): string | null => {
  if (!errors || typeof errors !== "object") return null;

  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (!value) continue;
    if (typeof value === "object") {
      if ("message" in value && typeof (value as { message?: unknown }).message === "string") {
        return (value as { message: string }).message;
      }
      const nested = collectFirstErrorMessage(value);
      if (nested) return nested;
    }
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  animatedWrapper: {
    flex: 1,
    paddingHorizontal: 24,
  },
});
