import { Router } from 'express';
import {
  UrlController,
  shortenSchema,
  listUrlsSchema,
  urlIdParamSchema,
} from '../controllers/url.controller';
import { HealthController } from '../controllers/health.controller';
import { validate } from '../middleware/validate';
import { shortenRateLimiter } from '../middleware/rateLimiter';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', HealthController.getHealth);

// Global Stats endpoint
apiRouter.get('/stats', UrlController.getStats);

// Shorten URL endpoint
apiRouter.post(
  '/shorten',
  shortenRateLimiter,
  validate(shortenSchema),
  UrlController.shorten
);

// List shortened URLs endpoint
apiRouter.get(
  '/urls',
  validate(listUrlsSchema),
  UrlController.listUrls
);

// Detailed Analytics for a single URL
apiRouter.get(
  '/urls/:id/analytics',
  validate(urlIdParamSchema),
  UrlController.getAnalytics
);

// Delete URL endpoint
apiRouter.delete(
  '/urls/:id',
  validate(urlIdParamSchema),
  UrlController.deleteUrl
);
