import { AxiosError } from "axios";
import { camelizeKeys } from "humps";
import { ApiErrorResponse } from "@/src/types";

export const API_ERROR_CODES = {
  INVALID_CREDENTIALS: "AU_001",
  ACCOUNT_NOT_ACTIVE: "AU_004",
  ACCOUNT_ALREADY_EXISTS: "AU_007",
  ACCOUNT_NOT_FOUND: "AU_008",
  VALIDATION_ERROR: "VALIDATION_ERR",
  SERVER_ERROR: "INTERNAL_ERR",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

/** Codes every endpoint can return, mapped to user-friendly Polish copy. */
const GLOBAL_USER_MESSAGES: Partial<Record<string, string>> = {
  [API_ERROR_CODES.VALIDATION_ERROR]:
    "Sprawdź poprawność wprowadzonych danych.",
  [API_ERROR_CODES.SERVER_ERROR]:
    "Coś poszło nie tak po stronie serwera. Spróbuj ponownie później.",
};

/** Auth-specific copy, applied on top of the global map by parseAuthError. */
const AUTH_USER_MESSAGES: Partial<Record<string, string>> = {
  [API_ERROR_CODES.INVALID_CREDENTIALS]:
    "Nieprawidłowy email lub hasło. Spróbuj ponownie.",
  [API_ERROR_CODES.ACCOUNT_NOT_ACTIVE]:
    "Twoje konto nie jest jeszcze aktywne. Sprawdź skrzynkę email.",
  [API_ERROR_CODES.ACCOUNT_ALREADY_EXISTS]:
    "Konto z tym adresem email lub nazwą użytkownika już istnieje.",
  [API_ERROR_CODES.ACCOUNT_NOT_FOUND]:
    "Nie znaleziono konta. Sprawdź dane lub zarejestruj się.",
};

/* Raw backend validation messages mapped to polish copy.*/
const VALIDATION_FIELD_MESSAGES: Partial<Record<string, string>> = {
  "Username contains inappropriate words":
    "Nazwa użytkownika zawiera niedozwolone słowa.",
  "Phone number must consist of 9-15 digits":
    "Numer telefonu musi składać się z 9-15 cyfr bez spacji.",
};

export const FALLBACK_MESSAGE = "Coś poszło nie tak. Spróbuj ponownie.";
export const NETWORK_MESSAGE =
  "Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.";
export const TIMEOUT_MESSAGE =
  "Serwer zbyt długo nie odpowiada. Spróbuj ponownie za chwilę.";

// ApiError — the single error shape the whole app sees

export class ApiError extends Error {
  readonly errorCode: string | undefined;
  /** User-friendly, renderable message. Identical to `message`. */
  readonly userMessage: string;
  /** Per-field validation errors keyed by (camelized) field name. */
  readonly validationErrors: Record<string, string> | undefined;
  readonly httpStatus: number | undefined;
  /** True when the request never reached the backend (offline / timeout). */
  readonly isNetworkError: boolean;
  /** True when the request timed out (subset of network errors). */
  readonly isTimeout: boolean;

  constructor(params: {
    userMessage: string;
    errorCode?: string;
    validationErrors?: Record<string, string>;
    httpStatus?: number;
    isNetworkError?: boolean;
    isTimeout?: boolean;
  }) {
    super(params.userMessage);
    this.name = "ApiError";
    this.errorCode = params.errorCode;
    this.userMessage = params.userMessage;
    this.validationErrors = params.validationErrors;
    this.httpStatus = params.httpStatus;
    this.isNetworkError = params.isNetworkError ?? false;
    this.isTimeout = params.isTimeout ?? false;
  }

  get isServerError(): boolean {
    return this.httpStatus !== undefined && this.httpStatus >= 500;
  }

  get isClientError(): boolean {
    return (
      this.httpStatus !== undefined &&
      this.httpStatus >= 400 &&
      this.httpStatus < 500
    );
  }
}

// Parsing

const isTimeoutError = (error: AxiosError): boolean =>
  error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";

/**
 * Converts any thrown value into an `ApiError`.
 *
 *  (a) Already an ApiError            → remap copy if a domain map knows the code
 *  (b) AxiosError, no response        → network / timeout error
 *  (c) AxiosError, known error code   → user-friendly copy (+ validation map)
 *  (d) AxiosError, unknown error code → backend's own message
 *  (e) Anything else                  → generic fallback
 *
 * @param messages optional domain-specific overrides (e.g. auth copy) that
 *                 take precedence over the global error-code map.
 */
export function parseApiError(
  error: unknown,
  messages?: Partial<Record<string, string>>,
): ApiError {
  // (a) Idempotent: re-wrap only to apply more specific domain copy
  if (error instanceof ApiError) {
    const override = error.errorCode ? messages?.[error.errorCode] : undefined;
    if (!override || override === error.userMessage) return error;
    return new ApiError({
      userMessage: override,
      errorCode: error.errorCode,
      validationErrors: error.validationErrors,
      httpStatus: error.httpStatus,
      isNetworkError: error.isNetworkError,
      isTimeout: error.isTimeout,
    });
  }

  if (error instanceof AxiosError) {
    // (b) Request never reached the backend
    if (!error.response) {
      const isTimeout = isTimeoutError(error);
      return new ApiError({
        userMessage: isTimeout ? TIMEOUT_MESSAGE : NETWORK_MESSAGE,
        isNetworkError: true,
        isTimeout,
      });
    }

    // The backend serializes errors in snake_case; normalize to camelCase
    const raw = error.response.data;
    const body = (
      raw && typeof raw === "object" ? camelizeKeys(raw) : {}
    ) as ApiErrorResponse;
    const httpStatus = error.response.status;
    const errorCode = body.errorCode;

    const mappedMessage = errorCode
      ? (messages?.[errorCode] ?? GLOBAL_USER_MESSAGES[errorCode])
      : undefined;

    const specificValidationMessage = pickValidationMessage(
      body.validationErrors,
    );

    // (c) + (d)
    return new ApiError({
      userMessage:
        specificValidationMessage ??
        mappedMessage ??
        body.message ??
        FALLBACK_MESSAGE,
      errorCode,
      httpStatus,
      validationErrors: translateValidationErrors(body.validationErrors),
    });
  }

  // (e)
  return new ApiError({ userMessage: FALLBACK_MESSAGE });
}

// Auth flows get more specific copy for auth error codes.
export function parseAuthError(error: unknown): ApiError {
  return parseApiError(error, AUTH_USER_MESSAGES);
}

// ------ validation helpers ------
/** Applies VALIDATION_FIELD_MESSAGES to each field in a validation map,
 *  falling back to the backend's own text for messages we don't know. */
function translateValidationErrors(
  validationErrors: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!validationErrors) return undefined;
  return Object.fromEntries(
    Object.entries(validationErrors).map(([field, message]) => [
      field,
      VALIDATION_FIELD_MESSAGES[message] ?? message,
    ]),
  );
}

// Returns the first known per-field translation, if any.
function pickValidationMessage(
  validationErrors: Record<string, string> | undefined,
): string | undefined {
  if (!validationErrors) return undefined;
  for (const message of Object.values(validationErrors)) {
    const translated = VALIDATION_FIELD_MESSAGES[message];
    if (translated) return translated;
  }
  return undefined;
}
