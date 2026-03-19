import type { TFunction } from 'i18next';

/**
 * Maps API error messages to appropriate translation keys
 * @param errorMessage - The error message from the API
 * @param t - Translation function from useTranslation hook
 * @returns Translated error message
 */
export const mapAuthErrorToTranslation = (errorMessage: string | null | undefined, t: TFunction): string => {
  if (!errorMessage) {
    return t('errors.auth.loginFailedGeneric');
  }

  // Convert to lowercase for easier matching
  const lowerError = errorMessage.toLowerCase();

  // Map common API error messages to translation keys
  if (lowerError.includes('unauthorized') || lowerError.includes('401')) {
    return t('errors.auth.unauthorized');
  }

  if (lowerError.includes('invalid credentials') || lowerError.includes('invalid login') || lowerError.includes('wrong password')) {
    return t('errors.auth.invalidCredentials');
  }

  if (lowerError.includes('user not found') || lowerError.includes('account not found')) {
    return t('errors.auth.userNotFound');
  }

  if (lowerError.includes('email') && lowerError.includes('exists')) {
    return t('auth.emailAlreadyExists');
  }

  if (lowerError.includes('network') || lowerError.includes('connection')) {
    return t('errors.generic.networkError');
  }

  if (lowerError.includes('server') || lowerError.includes('500')) {
    return t('errors.generic.serverError');
  }

  if (lowerError.includes('forbidden') || lowerError.includes('403')) {
    return t('errors.generic.forbidden');
  }

  if (lowerError.includes('not found') || lowerError.includes('404')) {
    return t('errors.generic.notFound');
  }

  // For login specific errors
  if (lowerError.includes('login failed') || lowerError.includes('authentication failed')) {
    return t('errors.auth.loginFailedGeneric');
  }

  // For registration specific errors
  if (lowerError.includes('register') || lowerError.includes('registration')) {
    return t('errors.auth.registerFailed');
  }

  // Default fallback
  return t('errors.auth.loginFailedGeneric');
};

/**
 * Maps specific HTTP status codes to translation keys
 * @param statusCode - HTTP status code
 * @param t - Translation function
 * @returns Translated error message
 */
export const mapStatusCodeToTranslation = (statusCode: number | undefined, t: TFunction): string => {
  switch (statusCode) {
    case 401:
      return t('errors.auth.unauthorized');
    case 403:
      return t('errors.generic.forbidden');
    case 404:
      return t('errors.generic.notFound');
    case 500:
      return t('errors.generic.serverError');
    default:
      return t('errors.auth.loginFailedGeneric');
  }
};