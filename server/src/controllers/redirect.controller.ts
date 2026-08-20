import { Request, Response, NextFunction } from 'express';
import { UrlService } from '../services/url.service';
import { AnalyticsService } from '../services/analytics.service';
import { extractRequestMetadata } from '../utils/geo';
import { logger } from '../utils/logger';

export class RedirectController {
  public static async handleRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shortCode } = req.params;

      if (!shortCode) {
        res.status(404).send('Short link not found.');
        return;
      }

      const url = await UrlService.findByShortCode(shortCode);

      if (!url) {
        logger.warn('Redirect failed: Short code not found', { shortCode });
        res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Link Not Found | LinkLite</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; color: #F9FAFB; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: #111827; border: 1px solid #1F2937; padding: 2rem; border-radius: 12px; text-align: center; max-width: 400px; }
              h1 { margin-top: 0; color: #3B82F6; font-size: 1.5rem; }
              p { color: #94A3B8; font-size: 0.95rem; line-height: 1.5; }
              a { color: #3B82F6; text-decoration: none; font-weight: 500; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Link Not Found</h1>
              <p>The shortened link you are looking for does not exist or may have been deleted.</p>
            </div>
          </body>
          </html>
        `);
        return;
      }

      // Asynchronously extract and log analytics without blocking redirect response
      const metadata = extractRequestMetadata(req);
      AnalyticsService.recordClick(url.id, metadata).catch((err) => {
        logger.error('Background click logging error', { error: err.message });
      });

      // Prevent proxy caching so every click is captured
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      return res.redirect(302, url.originalUrl);
    } catch (error) {
      next(error);
    }
  }
}
