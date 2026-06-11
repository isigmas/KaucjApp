export const FAQ_DATA = [
  {
    category: "O aplikacji",
    items: [
      {
        question: "Jaka jest misja KaucjApp?",
        answer:
          "KaucjApp to platforma łącząca osoby posiadające opakowania zwrotne z lokalnymi ekobohaterami, którzy pomagają w ich sprawnym recyklingu.",
      },
    ],
  },
  {
    category: "Wystawianie i realizacja ofert",
    items: [
      {
        question: "Kto może wystawiać oferty?",
        answer:
          'Każdy zalogowany użytkownik może wystawiać swoje ogłoszenia, przechodząc do sekcji "Utwórz".',
      },
      {
        question: "Jakie opakowania kaucyjne mogę wystawić w KaucjApp?",
        answer:
          "KaucjApp umożliwia wystawianie ofert z dwoma typami opakowań kaucyjnych:",
        list: ["Plastikowe butelki (PET)", "Metalowe puszki"],
        note: "Ważne! Opakowania muszą być oznaczone jako kaucyjne.",
        image: "deposit-mark",
      },
      {
        question: "Czy mogę anulować wystawioną ofertę?",
        answer: "Tak. Użytkownik wystawiający ofertę może ją anulować.",
      },
      {
        question: "Kto może odbierać oferty?",
        answer:
          "Każdy zarejestrowany użytkownik może zarezerwować ofertę i następnie odebrać butelki od innego użytkownika.",
      },
      {
        question: "Jak rozliczane są pieniądze za kaucję?",
        answer:
          "Podział środków zależy od warunków konkretnej oferty. Informację o tym, jaka część kaucji trafi do Ciebie, a jaka do wystawiającego, znajdziesz w szczegółach ogłoszenia przed jego akceptacją.",
      },
    ],
  },
  {
    category: "Punkty zwrotu",
    items: [
      {
        question: "Gdzie mogę zwrócić butelki?",
        answer:
          "Punkty zwrotu są zaznaczone pinezkami na mapie wraz z odpowiadającym im statusem.",
      },
      {
        question: "Gdzie mogę zgłosić awarię kaucjomatu?",
        answer:
          "Klikając w pinezkę danego kaucjomatu można zgłosić jego awarię lub przepełnienie, klikając w jego obecny status.",
      },
    ],
  },
  {
    category: "Techniczne",
    items: [
      {
        question: "Zapomniałem hasła – co teraz?",
        answer:
          'Skorzystaj z opcji "Resetuj hasło" na ekranie logowania. Wyślemy Ci bezpieczny link, który pozwoli na ustawienie nowego hasła.',
      },
      {
        question: "Jak długo ważny jest link do resetu hasła?",
        answer:
          "Ze względów bezpieczeństwa link wygasa po godzinie od jego wygenerowania.",
      },
      {
        question: "Czy mogę usunąć konto?",
        answer:
          "Tak. Po zleceniu usunięcia konta Twoje dane są zanonimizowane zgodnie z klauzulą RODO.",
      },
      {
        question: 'Co oznacza status "zawieszone"?',
        answer:
          "Konto może zostać zawieszone przez administratora w przypadku naruszenia regulaminu. W tym stanie logowanie jest niemożliwe.",
      },
    ],
  },
] as const;

export type FaqItem = (typeof FAQ_DATA)[number]["items"][number];
