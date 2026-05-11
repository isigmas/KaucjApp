import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated } from "react-native";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import type BottomSheet from "@gorhom/bottom-sheet";
import { useCreateOffer } from "@/src/api/hooks/use-offer";
import {
  buildOfferPayload,
  defaultOfferFormValues,
  offerFormSchema,
  type OfferFormValues,
} from "./offer-form-schema";
import type { PickedLocation } from "./location-bottom-sheet";

export interface ProgressStep {
  number: number;
  label: string;
}

export const STEPS: readonly ProgressStep[] = [
  { number: 1, label: "Ilość i cena" },
  { number: 2, label: "Adres" },
  { number: 3, label: "Podgląd" },
] as const;

const FIRST_STEP = STEPS[0].number;

/**
 * Brain of the offer creator. Owns every piece of cross-cutting state and
 * exposes a small, intention-revealing API to the view layer:
 *
 *  - the `react-hook-form` instance (passed straight to `FormProvider`)
 *  - step navigation (`currentStep`, `goToStep`)
 *  - the success-screen toggle (`isSuccess`)
 *  - the location picker bottom-sheet ref + commit callback
 *  - the submit / reset / go-home actions
 *  - the slide-in animation style for the active step
 *
 * Keeping all of this in one hook makes `CreateOfferScreen` a pure render
 * function and lets every step component focus on its own UI.
 */
export function useOfferCreator() {
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
  const [pickerInitialLocation, setPickerInitialLocation] =
    useState<PickedLocation | null>(null);

  const locationSheetRef = useRef<BottomSheet>(null);

  // ---------------------------------------------------------------------------
  // Location picker
  // ---------------------------------------------------------------------------

  const openLocationPicker = () => {
    const { latitude, longitude } = form.getValues();
    setPickerInitialLocation(
      latitude !== null && longitude !== null ? { latitude, longitude } : null,
    );
    locationSheetRef.current?.snapToIndex(0);
  };

  const applyPickedLocation = (location: PickedLocation) => {
    console.log("applyPickedLocation", location);
    form.setValue("latitude", location.latitude, { shouldValidate: true });
    form.setValue("longitude", location.longitude, { shouldValidate: true });
    locationSheetRef.current?.close();
  };

  // ---------------------------------------------------------------------------
  // Submission
  // ---------------------------------------------------------------------------

  const submit = form.handleSubmit(
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
    (errors: FieldErrors<OfferFormValues>) => {
      // Surface the first blocking error and route the user to the step
      // where they can fix it.
      if (errors.plasticBottles || errors.cans) {
        setCurrentStep(1);
      } else if (errors.latitude || errors.longitude || errors.pickupAddress) {
        setCurrentStep(2);
      }

      const firstMessage = collectFirstErrorMessage(errors);
      if (firstMessage) Alert.alert("Sprawdź formularz", firstMessage);
    },
  );

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  const reset = () => {
    form.reset(defaultOfferFormValues);
    setCurrentStep(FIRST_STEP);
    setIsSuccess(false);
  };

  const goHome = () => {
    reset();
    router.navigate("/(app)/(tabs)/home");
  };

  // ---------------------------------------------------------------------------
  // Slide-in animation between steps
  // ---------------------------------------------------------------------------

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSuccess) return;
    slideAnim.setValue(0);
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 9,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [currentStep, isSuccess, slideAnim]);

  const slideStyle = useMemo(
    () => ({
      opacity: slideAnim,
      transform: [
        {
          translateX: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          }),
        },
      ],
    }),
    [slideAnim],
  );

  return {
    form,
    currentStep,
    goToStep: setCurrentStep,
    isSuccess,
    isSubmitting: isPending,
    locationSheetRef,
    pickerInitialLocation,
    openLocationPicker,
    applyPickedLocation,
    submit,
    reset,
    goHome,
    slideStyle,
  };
}

/**
 * Walks a react-hook-form `errors` tree depth-first and returns the first
 * human-readable message found. Used to surface a single relevant error to
 * the user when they hit "Opublikuj" with an invalid form.
 */
const collectFirstErrorMessage = (errors: unknown): string | null => {
  if (!errors || typeof errors !== "object") return null;

  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;

    const message = (value as { message?: unknown }).message;
    if (typeof message === "string") return message;

    const nested = collectFirstErrorMessage(value);
    if (nested) return nested;
  }

  return null;
};
