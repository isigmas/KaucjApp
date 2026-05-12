import * as z from "zod";
import { COMPLAINT_REASONS } from "@/src/types/complaint";

export const complaintSchema = z.object({
  complaintReason: z.enum(COMPLAINT_REASONS, {
    error: "Wybierz powód zgłoszenia",
  }),
  message: z
    .string()
    .trim()
    .min(1, "Wiadomość jest wymagana")
    .max(500, "Wiadomość może mieć maksymalnie 500 znaków"),
});
export type ComplaintFormValues = z.infer<typeof complaintSchema>;
