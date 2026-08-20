export const CONSTANTS = {
  // Auto-generated short code parameters
  SHORT_CODE_MIN_LENGTH: 6,
  SHORT_CODE_MAX_LENGTH: 8,
  SHORT_CODE_CHARSET: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  MAX_COLLISION_RETRIES: 5,

  // Custom alias parameters
  CUSTOM_ALIAS_MIN_LENGTH: 3,
  CUSTOM_ALIAS_MAX_LENGTH: 32,

  // Reserved short codes that cannot be used
  RESERVED_CODES: new Set([
    'api',
    'health',
    'admin',
    'login',
    'signup',
    'dashboard',
    'auth',
    'static',
    'favicon',
    'robots',
    'sitemap',
    'terms',
    'privacy',
    'docs',
  ]),

  // URL limitations
  MAX_URL_LENGTH: 2048,
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
} as const;
