import * as z from "zod";

// AUTH
export const signUpSchema = z.object({
  firstName: z.string().min(2, "Podaj swoje imię."),
  lastName: z.string().min(2, "Podaj swoje nazwisko."),
  userName: z
    .string()
    .min(3, "Nazwa użytkownika musi mieć co najmniej 3 znaki."),
  phoneNumber: z.string().min(9, "Podaj poprawny numer telefonu."),
  email: z.string().email("Wprowadź poprawny adres email."),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków."),
}); //username
export const signInSchema = z.object({
  email: z.string().email("Wprowadź poprawny adres email."),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków."),
});
export type SignUpValues = z.infer<typeof signUpSchema>;
export type SignInValues = z.infer<typeof signInSchema>;
