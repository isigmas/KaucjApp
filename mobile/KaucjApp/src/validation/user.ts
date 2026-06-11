import { z } from "zod";

export const UpdateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, "Imię musi mieć co najmniej 1 znak")
    .max(100, "Imię musi mieć maksymalnie 100 znaków")
    .nullable()
    .optional(),

  lastName: z
    .string()
    .min(1, "Nazwisko musi mieć co najmniej 1 znak")
    .max(100, "Nazwisko musi mieć maksymalnie 100 znaków")
    .nullable()
    .optional(),
});

export type UpdateUserFormValues = z.infer<typeof UpdateUserSchema>;
