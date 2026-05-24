import * as z from "zod";

// TODO: change the name to reviewSchema XD nie chce mi sie teraz bo robię coś innego a akurat zauwazyłem
export const ratingSchema = z.object({
  score: z.number().min(1).max(5),
  comment: z.string().optional(),
});
export type RatingFormValues = z.infer<typeof ratingSchema>;
