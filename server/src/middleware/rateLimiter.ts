import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests created from this IP, please try again later.',
    },
  },
});

export const shortenRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // max 30 shorten requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'SHORTEN_RATE_LIMIT',
      message: 'Rate limit reached for creating short links. Please wait a moment.',
    },
  },
});
