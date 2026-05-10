import { z } from "zod";
import type { OfferItemPayload, OfferPayload } from "@/src/types";

/**
 * Domain constants for the offer form.
 *
 * The backend constrains `unitPrice` to the [0, 0.5] range and requires at
 * least one item. We mirror those rules here so the user gets immediate,
 * client-side feedback before the network round-trip.
 */
export const PRICE_MIN = 0;
export const PRICE_MAX = 0.5;
export const DEPOSIT_VALUE_PER_UNIT = 0.5;
export const PLASTIC_BOTTLE_ID = 1 as const;
export const CAN_BOTTLE_ID = 2 as const;

/**
 * Single source of truth for the offer creator form. The shape intentionally
 * stays close to the API payload (`OfferPayload`) — only quantities are split
 * per item type so the UI can drive separate steppers/sliders.
 */
export const offerFormSchema = z
  .object({
    plasticBottles: z.number().int().min(0),
    cans: z.number().int().min(0),
    plasticPrice: z.number().min(PRICE_MIN).max(PRICE_MAX),
    cansPrice: z.number().min(PRICE_MIN).max(PRICE_MAX),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    pickupAddress: z.string().trim().min(1, "Adres odbioru jest wymagany"),
    pickupInstructions: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.plasticBottles + values.cans <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Dodaj co najmniej jedno opakowanie kaucyjne",
        path: ["plasticBottles"],
      });
    }

    if (values.latitude === null || values.longitude === null) {
      ctx.addIssue({
        code: "custom",
        message: "Wskaż lokalizację odbioru na mapie",
        path: ["latitude"],
      });
    }
  });

export type OfferFormValues = z.infer<typeof offerFormSchema>;

export const defaultOfferFormValues: OfferFormValues = {
  plasticBottles: 10,
  cans: 0,
  plasticPrice: 0.2,
  cansPrice: 0.2,
  latitude: null,
  longitude: null,
  pickupAddress: "",
  pickupInstructions: "",
};

/**
 * Maps validated form values to the API payload contract.
 *
 * Must only be called after a successful `handleSubmit` — the schema guarantees
 * coordinates are present and at least one item exists, so the non-null
 * assertions are safe at this point.
 */
export const buildOfferPayload = (values: OfferFormValues): OfferPayload => {
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
