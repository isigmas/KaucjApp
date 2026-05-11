import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated } from "react-native";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import type BottomSheet from "@gorhom/bottom-sheet";
import { useUserLocation } from "@/src/hooks/use-user-location";
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
 *  - the single, resolved {selectedLocation, defaultLocation} pair used by
 *    every map view (thumbnail + picker)
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

  // ---------------------------------------------------------------------------
  // Location
  //
  // Two derived values, single source of truth in this hook:
  //
  //  - `defaultLocation`: where the picker pin should sit before the user
  //    confirms anything. Sourced from the shared `useUserLocation` hook so
  //    the offer creator and the map screen share one location-fetching
  //    pipeline (and one permission prompt). `null` while still loading.
  //
  //  - `selectedLocation`: the user's confirmed selection, taken straight
  //    from the form's lat/lng. `null` until they tap "Potwierdź".
  //
  // The picker map only mounts once `defaultLocation` is non-null, which
  // guarantees its `initialRegion` is the final answer — no Kraków → GPS
  // jump on first open.
  // ---------------------------------------------------------------------------

  const { initialRegion } = useUserLocation();

  const defaultLocation = useMemo<PickedLocation | null>(
    () =>
      initialRegion
        ? {
            latitude: initialRegion.latitude,
            longitude: initialRegion.longitude,
          }
        : null,
    [initialRegion],
  );

  const latitude = useWatch({ control: form.control, name: "latitude" });
  const longitude = useWatch({ control: form.control, name: "longitude" });
  const selectedLocation = useMemo<PickedLocation | null>(
    () =>
      typeof latitude === "number" && typeof longitude === "number"
        ? { latitude, longitude }
        : null,
    [latitude, longitude],
  );

  const locationSheetRef = useRef<BottomSheet>(null);
  const pendingOpenRef = useRef(false);

  const openLocationPicker = useCallback(() => {
    // The sheet is only mounted once `defaultLocation` is ready. If the user
    // taps the button before that, remember the intent and fire as soon as
    // the sheet renders — usually a frame or two later.
    if (defaultLocation) {
      locationSheetRef.current?.snapToIndex(0);
    } else {
      pendingOpenRef.current = true;
    }
  }, [defaultLocation]);

  useEffect(() => {
    if (!defaultLocation || !pendingOpenRef.current) return;
    pendingOpenRef.current = false;
    // Give the BottomSheet one paint to mount before we try to open it.
    const handle = requestAnimationFrame(() =>
      locationSheetRef.current?.snapToIndex(0),
    );
    return () => cancelAnimationFrame(handle);
  }, [defaultLocation]);

  const applyPickedLocation = useCallback(
    (location: PickedLocation) => {
      form.setValue("latitude", location.latitude, {
        shouldValidate: true,
        shouldDirty: true,
      });
      form.setValue("longitude", location.longitude, {
        shouldValidate: true,
        shouldDirty: true,
      });
      locationSheetRef.current?.close();
    },
    [form],
  );

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

  const reset = useCallback(() => {
    form.reset(defaultOfferFormValues);
    setCurrentStep(FIRST_STEP);
    setIsSuccess(false);
  }, [form]);

  const goHome = useCallback(() => {
    reset();
    router.navigate("/(app)/(tabs)/home");
  }, [reset, router]);

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
    selectedLocation,
    defaultLocation,
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
