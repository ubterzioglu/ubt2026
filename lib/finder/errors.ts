// Hata sınıfları — corteqsmvp workers/service-finder/src/errors.ts portu.
// Retry davranışı senkron koşuda basitleşir: retryable hatalar işi "queued"a
// geri bırakmaz, iş failed olur ve admin "Tekrar dene" ile yeniden kuyruğa alır.

export class BudgetExceededError extends Error {
  readonly code = "budget_exceeded";
  constructor(message = "Hard cap aşıldı") {
    super(message);
    this.name = "BudgetExceededError";
  }
}

export class ProviderRateLimitError extends Error {
  readonly code = "provider_rate_limited";
  constructor(provider: string) {
    super(`Sağlayıcı rate limit: ${provider}`);
    this.name = "ProviderRateLimitError";
  }
}

export class ProviderTemporaryError extends Error {
  readonly code = "provider_temporary";
  constructor(provider: string, detail: string) {
    super(`Geçici sağlayıcı hatası (${provider}): ${detail}`);
    this.name = "ProviderTemporaryError";
  }
}

export class AuthOrConfigError extends Error {
  readonly code = "auth_or_config";
  constructor(detail: string) {
    super(`Yapılandırma/yetki hatası: ${detail}`);
    this.name = "AuthOrConfigError";
  }
}

export function errorCode(error: unknown): string {
  if (
    error instanceof BudgetExceededError ||
    error instanceof ProviderRateLimitError ||
    error instanceof ProviderTemporaryError ||
    error instanceof AuthOrConfigError
  ) {
    return error.code;
  }
  return "unexpected_error";
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Beklenmeyen hata";
}
