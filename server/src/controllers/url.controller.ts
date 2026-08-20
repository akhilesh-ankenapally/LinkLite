import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UrlService } from '../services/url.service';
import { AnalyticsService } from '../services/analytics.service';
import { CONSTANTS } from '../config/constants';

export const shortenSchema = {
  body: z.object({
    url: z
      .string()
      .min(1, 'URL is required')
      .max(CONSTANTS.MAX_URL_LENGTH, `URL cannot exceed ${CONSTANTS.MAX_URL_LENGTH} characters`),
    customAlias: z.string().optional(),
  }),
};

export const listUrlsSchema = {
  query: z.object({
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(CONSTANTS.MAX_PAGE_SIZE).optional(),
    offset: z.coerce.number().min(0).optional(),
  }),
};

export const urlIdParamSchema = {
  params: z.object({
    id: z.string().uuid('Invalid URL ID format'),
  }),
};

export class UrlController {
  public static async shorten(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url, customAlias } = req.body;
      const result = await UrlService.shorten(url, customAlias);
      res.status(201).json(result);
    } catch (error: any) {
      if (
        error.message.includes('Invalid URL') ||
        error.message.includes('Custom alias') ||
        error.message.includes('protocols')
      ) {
        res.status(400).json({
          error: {
            code: 'BAD_REQUEST',
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  }

  public static async listUrls(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, limit, offset } = req.query as any;
      const result = await UrlService.listUrls({
        search,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const analytics = await AnalyticsService.getUrlAnalytics(id);

      if (!analytics) {
        res.status(404).json({
          error: {
            code: 'URL_NOT_FOUND',
            message: 'URL with the specified ID does not exist',
          },
        });
        return;
      }

      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  }

  public static async deleteUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await UrlService.deleteUrl(id);

      if (!deleted) {
        res.status(404).json({
          error: {
            code: 'URL_NOT_FOUND',
            message: 'URL with the specified ID does not exist',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'URL and associated analytics successfully deleted',
        id,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AnalyticsService.getGlobalStats();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
}
