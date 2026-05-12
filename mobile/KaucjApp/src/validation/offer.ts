import { z } from "zod";

export const PRICE_MIN = 0;
export const PRICE_MAX = 0.5;
export const DEPOSIT_VALUE_PER_UNIT = 0.5;
export const PLASTIC_BOTTLE_ID = 1 as const;
export const CAN_BOTTLE_ID = 2 as const;

export const offerFormSchema = z
  .object({
    plasticBottles: z.number().int().min(0),
    cans: z.number().int().min(0),
    plasticPrice: z.number().min(PRICE_MIN).max(PRICE_MAX),
    cansPrice: z.number().min(PRICE_MIN).max(PRICE_MAX),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    pickupAddress: z.string().trim(),
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
    if (values.pickupAddress.trim() === "") {
      ctx.addIssue({
        code: "custom",
        message: "Wprowadź adres odbioru",
        path: ["pickupAddress"],
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
