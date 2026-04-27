import * as z from "zod";

// AUTH
export const signUpSchema = z.object({
  firstName: z.string().trim().min(2, "Podaj swoje imię."),
  lastName: z.string().trim().min(2, "Podaj swoje nazwisko."),
  userName: z
    .string()
    .trim()
    .min(6, "Nazwa użytkownika musi mieć co najmniej 6 znaków.")
    .regex(/^\S+$/, "Nazwa użytkownika nie może zawierać spacji."),
  phoneNumber: z.string().trim().min(9, "Podaj poprawny numer telefonu."),
  email: z.string().trim().email("Wprowadź poprawny adres email."),
  password: z
    .string()
    .trim()
    .min(6, "Hasło musi mieć co najmniej 6 znaków.")
    .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę.")
    .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę.")
    .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę.")
    .regex(
      /[^a-zA-Z0-9]/,
      "Hasło musi zawierać co najmniej jeden znak specjalny.",
    ),
});
export const signInSchema = z.object({
  email: z.string().trim().email("Wprowadź poprawny adres email."),
  password: z.string().trim().min(6, "Hasło musi mieć co najmniej 6 znaków."),
});
export type SignUpValues = z.infer<typeof signUpSchema>;
export type SignInValues = z.infer<typeof signInSchema>;
