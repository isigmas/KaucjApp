import * as z from "zod";

// AUTH
export const signUpSchema = z.object({
  name: z.string().min(2, "Podaj swoje imię."),
  email: z.string().email("Wprowadź poprawny adres email."),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków."),
});
export const signInSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email."),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków."),
});
export type SignUpValues = z.infer<typeof signUpSchema>;
export type SignInValues = z.infer<typeof signInSchema>;
