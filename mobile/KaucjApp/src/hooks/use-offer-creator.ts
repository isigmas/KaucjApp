import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated } from "react-native";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import type BottomSheet from "@gorhom/bottom-sheet";
import { useUserLocation } from "@/src/hooks/use-user-location";
import { useCreateOffer } from "@/src/api/hooks/use-offer";
import type { PickedLocation } from "../components/offer_creator/location-bottom-sheet";
import { OfferItemPayload, OfferPayload } from "@/src/types";
import {
  defaultOfferFormValues,
  offerFormSchema,
  OfferFormValues,
  DEPOSIT_VALUE_PER_UNIT,
  PLASTIC_BOTTLE_ID,
  CAN_BOTTLE_ID,
} from "@/src/validation";

export function useOfferCreator() {
  const router = useRouter();
  const { mutate: createOffer, isPending } = useCreateOffer();

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: defaultOfferFormValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState(false);

  // LOCATION ---------------------------------------------------------------------------

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
    // taps the button before that, remember the intent and fire as soon as the sheet renders
    if (defaultLocation) {
      locationSheetRef.current?.snapToIndex(0);
    } else {
      pendingOpenRef.current = true;
    }
  }, [defaultLocation]);

  useEffect(() => {
    if (!defaultLocation || !pendingOpenRef.current) return;
    pendingOpenRef.current = false;
    // Give the BottomSheet one paint to mount before opening it.
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

  // SUBMISSION ---------------------------------------------------------------------------

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
      if (errors.plasticBottles || errors.cans) {
        setCurrentStep(1);
      } else if (errors.latitude || errors.longitude || errors.pickupAddress) {
        setCurrentStep(2);
      }

      const firstMessage = collectFirstErrorMessage(errors);
      if (firstMessage) Alert.alert("Sprawdź formularz", firstMessage);
    },
  );

  // LIFECYCLE ---------------------------------------------------------------------------

  const reset = useCallback(() => {
    form.reset(defaultOfferFormValues);
    setCurrentStep(1);
    setIsSuccess(false);
  }, [form]);

  const goHome = useCallback(() => {
    reset();
    router.navigate("/(app)/(tabs)/home");
  }, [reset, router]);

  // ANIMATION ---------------------------------------------------------------------------

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

const buildOfferPayload = (values: OfferFormValues): OfferPayload => {
  const items: OfferItemPayload[] = [];

  if (values.plasticBottles > 0) {
    items.push({
      bottleId: PLASTIC_BOTTLE_ID,
      quantity: values.plasticBottles,
      unitPrice: values.plasticPrice,
    });
  }

  if (values.cans > 0) {
    items.push({
      bottleId: CAN_BOTTLE_ID,
      quantity: values.cans,
      unitPrice: values.cansPrice,
    });
  }

  const trimmedInstructions = values.pickupInstructions?.trim();

  return {
    latitude: values.latitude as number,
    longitude: values.longitude as number,
    pickupAddress: values.pickupAddress.trim(),
    pickupInstructions: trimmedInstructions ? trimmedInstructions : undefined,
    items,
  };
};

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

/**
 * Pure helpers for the totals shown on steps 1 and 3. Centralised so the two
 * steps cannot drift out of sync.
 */
export const computeOfferTotals = (values: OfferFormValues) => {
  const totalDepositValue =
    (values.plasticBottles + values.cans) * DEPOSIT_VALUE_PER_UNIT;

  const userPrice =
    values.plasticBottles * values.plasticPrice +
    values.cans * values.cansPrice;

  const courierProfit = totalDepositValue - userPrice;

  return { totalDepositValue, userPrice, courierProfit };
};
