import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/src/types";

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: "AU_001",
  ACCOUNT_NOT_ACTIVE: "AU_004",
  ACCOUNT_ALREADY_EXISTS: "AU_007",
  ACCOUNT_NOT_FOUND: "AU_008",
  VALIDATION_ERROR: "VALIDATION_ERR",
  SERVER_ERROR: "INTERNAL_ERR",
} as const;
type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

const USER_MESSAGES: Record<AuthErrorCode, string> = {
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]:
    "Nieprawidłowy email lub hasło. Spróbuj ponownie.",
  [AUTH_ERROR_CODES.ACCOUNT_NOT_ACTIVE]:
    "Twoje konto nie jest jeszcze aktywne. Sprawdź skrzynkę email.",
  [AUTH_ERROR_CODES.ACCOUNT_ALREADY_EXISTS]:
    "Konto z tym adresem email lub nazwą użytkownika już istnieje.",
  [AUTH_ERROR_CODES.ACCOUNT_NOT_FOUND]:
    "Nie znaleziono konta. Sprawdź dane lub zarejestruj się.",
  [AUTH_ERROR_CODES.VALIDATION_ERROR]:
    "Sprawdź poprawność wprowadzonych danych.",
  [AUTH_ERROR_CODES.SERVER_ERROR]:
    "500 - Coś poszło nie tak po stronie serwera. Spróbuj ponowie później",
};

const FALLBACK_MESSAGE = "Coś poszło nie tak. Spróbuj ponownie.";
const NETWORK_MESSAGE =
  "Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.";

// Error subclass that replaces the raw AxiosError React Query mutation.error will always be this shape
export class AuthError extends Error {
  readonly errorCode: string | undefined;
  readonly userMessage: string;
  readonly validationErrors: Record<string, string> | undefined;
  readonly httpStatus: number | undefined;
  readonly isNetworkError: boolean;

  constructor(params: {
    userMessage: string;
    errorCode?: string;
    validationErrors?: Record<string, string>;
    httpStatus?: number;
    isNetworkError?: boolean;
  }) {
    super(params.userMessage);
    this.name = "AuthError";
    this.errorCode = params.errorCode;
    this.userMessage = params.userMessage;
    this.validationErrors = params.validationErrors;
    this.httpStatus = params.httpStatus;
    this.isNetworkError = params.isNetworkError ?? false;
  }
}

//      (a) Already an AuthError           → return as-is (idempotent)
//      (b) AxiosError, no response        → network / timeout error
//      (c) AxiosError, VALIDATION_ERR     → include the per-field error map
//      (d) AxiosError, known error code   → map to user-friendly copy
//      (e) AxiosError, unknown error code → fall back to the server's message
//      (f) Anything else                  → generic fallback

export function parseAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error; // (a)
  }

  if (error instanceof AxiosError) {
    if (!error.response) {
      return new AuthError({
        userMessage: NETWORK_MESSAGE,
        isNetworkError: true,
      }); // (b)
    }

    const body = error.response.data as ApiErrorResponse | undefined;
    const httpStatus = error.response.status;
    const errorCode = body?.errorCode;

    if (errorCode === AUTH_ERROR_CODES.VALIDATION_ERROR) {
      return new AuthError({
        // (c)
        errorCode,
        httpStatus,
        validationErrors: body?.validationErrors,
        userMessage: USER_MESSAGES[AUTH_ERROR_CODES.VALIDATION_ERROR],
      });
    }

    if (errorCode && errorCode in USER_MESSAGES) {
      return new AuthError({
        // (d)
        errorCode,
        httpStatus,
        userMessage: USER_MESSAGES[errorCode as AuthErrorCode],
      });
    }

    if (body?.message) {
      return new AuthError({
        errorCode,
        httpStatus,
        userMessage: body.message,
      }); // (e)
    }
  }

  return new AuthError({ userMessage: FALLBACK_MESSAGE }); // (f)
}
