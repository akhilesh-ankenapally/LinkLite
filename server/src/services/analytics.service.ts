import { prisma } from '../config/db';
import { UrlAnalyticsResponse, CountryMetric, ReferrerMetric } from '../types';
import { UrlService } from './url.service';
import { RequestMetadata } from '../utils/geo';
import { logger } from '../utils/logger';

export class AnalyticsService {
  /**
   * Asynchronously records a click log and increments click count.
   */
  public static async recordClick(urlId: string, metadata: RequestMetadata): Promise<void> {
    try {
      await prisma.$transaction([
        prisma.clickLog.create({
          data: {
            urlId,
            country: metadata.country,
            referrer: metadata.referrer,
          },
        }),
        prisma.url.update({
          where: { id: urlId },
          data: { clickCount: { increment: 1 } },
        }),
      ]);
    } catch (error) {
      logger.error('Failed to log click event', {
        urlId,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Fetches comprehensive analytics for a specific URL.
   */
  public static async getUrlAnalytics(urlId: string): Promise<UrlAnalyticsResponse | null> {
    const url = await prisma.url.findUnique({
      where: { id: urlId },
      include: {
        clicks: {
          orderBy: { clickedAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!url) {
      return null;
    }

    // Country aggregation
    const countryMap = new Map<string, number>();
    const referrerMap = new Map<string, number>();

    url.clicks.forEach((click) => {
      const country = click.country || 'Unknown';
      const referrer = click.referrer || 'Direct';

      countryMap.set(country, (countryMap.get(country) || 0) + 1);
      referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1);
    });

    const countries: CountryMetric[] = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    const referrers: ReferrerMetric[] = Array.from(referrerMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count);

    const lastClick = url.clicks.length > 0 ? url.clicks[0].clickedAt.toISOString() : null;

    return {
      id: url.id,
      shortCode: url.shortCode,
      shortUrl: UrlService.formatShortUrl(url.shortCode),
      originalUrl: url.originalUrl,
      totalClicks: Math.max(url.clickCount, url.clicks.length),
      lastClickAt: lastClick,
      countries,
      referrers,
      recentClicks: url.clicks.slice(0, 10).map((c) => ({
        id: c.id,
        country: c.country,
        referrer: c.referrer,
        clickedAt: c.clickedAt.toISOString(),
      })),
    };
  }

  /**
   * Get global stats summary
   */
  public static async getGlobalStats() {
    const [totalUrls, totalClicks] = await Promise.all([
      prisma.url.count(),
      prisma.url.aggregate({
        _sum: { clickCount: true },
      }),
    ]);

    return {
      totalUrls,
      totalClicks: totalClicks._sum.clickCount || 0,
    };
  }
}
