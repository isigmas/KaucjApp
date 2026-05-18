import * as z from "zod";

export const ratingSchema = z.object({
  score: z.number().min(1).max(5),
  comment: z.string().optional(),
});
export type RatingFormValues = z.infer<typeof ratingSchema>;
