export interface ApiErrorResponse {
  timestamp?: string;
  errorCode?: string;
  message?: string;
  path?: string;
  validationErrors?: Record<string, string>;
}
