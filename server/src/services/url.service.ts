import { prisma } from '../config/db';
import { CONSTANTS } from '../config/constants';
import { env } from '../config/env';
import { ShortCodeService } from './shortCode.service';
import { ShortenUrlResponse, UrlSummary, UrlListResponse } from '../types';
import { logger } from '../utils/logger';

export class UrlService {
  /**
   * Normalizes raw URL by trimming and validating protocol.
   */
  public static normalizeUrl(rawUrl: string): string {
    let trimmed = rawUrl.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }

    try {
      const parsed = new URL(trimmed);
      // Disallow javascript, data, or file schemes
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Only HTTP and HTTPS protocols are supported.');
      }
      return parsed.toString();
    } catch {
      throw new Error('Invalid URL format provided.');
    }
  }

  /**
   * Formats a short code into the full public short URL.
   */
  public static formatShortUrl(shortCode: string): string {
    const base = env.BASE_URL.replace(/\/+$/, '');
    return `${base}/${shortCode}`;
  }

  /**
   * Shortens a URL with collision detection and retry logic.
   */
  public static async shorten(url: string, customAlias?: string): Promise<ShortenUrlResponse> {
    const normalizedUrl = this.normalizeUrl(url);

    if (customAlias) {
      const alias = customAlias.trim();
      if (!ShortCodeService.isValidCode(alias, true)) {
        throw new Error(
          `Custom alias must be ${CONSTANTS.CUSTOM_ALIAS_MIN_LENGTH}-${CONSTANTS.CUSTOM_ALIAS_MAX_LENGTH} alphanumeric characters and not a reserved word.`
        );
      }

      const existing = await prisma.url.findUnique({
        where: { shortCode: alias },
      });

      if (existing) {
        throw new Error('Custom alias is already in use. Please choose another one.');
      }

      const created = await prisma.url.create({
        data: {
          originalUrl: normalizedUrl,
          shortCode: alias,
        },
      });

      return {
        id: created.id,
        shortCode: created.shortCode,
        shortUrl: this.formatShortUrl(created.shortCode),
        originalUrl: created.originalUrl,
        clickCount: created.clickCount,
        createdAt: created.createdAt.toISOString(),
      };
    }

    // Auto-generate unique short code with collision handling
    let codeLength = CONSTANTS.SHORT_CODE_MIN_LENGTH;
    let attempts = 0;

    while (attempts < CONSTANTS.MAX_COLLISION_RETRIES) {
      const candidateCode = ShortCodeService.generateCode(codeLength);

      if (CONSTANTS.RESERVED_CODES.has(candidateCode.toLowerCase())) {
        attempts++;
        continue;
      }

      try {
        const created = await prisma.url.create({
          data: {
            originalUrl: normalizedUrl,
            shortCode: candidateCode,
          },
        });

        logger.info('Short URL created', { id: created.id, shortCode: created.shortCode });

        return {
          id: created.id,
          shortCode: created.shortCode,
          shortUrl: this.formatShortUrl(created.shortCode),
          originalUrl: created.originalUrl,
          clickCount: created.clickCount,
          createdAt: created.createdAt.toISOString(),
        };
      } catch (error: any) {
        // Prisma unique constraint violation code is P2002
        if (error.code === 'P2002') {
          attempts++;
          // Escalate code length if collisions occur repeatedly
          if (attempts >= 3 && codeLength < CONSTANTS.SHORT_CODE_MAX_LENGTH) {
            codeLength++;
          }
          continue;
        }
        throw error;
      }
    }

    throw new Error('Could not generate unique short URL code. Please try again.');
  }

  /**
   * Fetches URL by short code.
   */
  public static async findByShortCode(shortCode: string) {
    return prisma.url.findUnique({
      where: { shortCode },
    });
  }

  /**
   * Lists URLs with search filtering and pagination.
   */
  public static async listUrls(params: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<UrlListResponse> {
    const limit = Math.min(params.limit || CONSTANTS.DEFAULT_PAGE_SIZE, CONSTANTS.MAX_PAGE_SIZE);
    const offset = params.offset || 0;
    const search = params.search?.trim();

    const where = search
      ? {
          OR: [
            { originalUrl: { contains: search, mode: 'insensitive' as const } },
            { shortCode: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [urls, total] = await Promise.all([
      prisma.url.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.url.count({ where }),
    ]);

    const formattedUrls: UrlSummary[] = urls.map((u) => ({
      id: u.id,
      originalUrl: u.originalUrl,
      shortCode: u.shortCode,
      shortUrl: this.formatShortUrl(u.shortCode),
      clickCount: u.clickCount,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));

    return {
      urls: formattedUrls,
      total,
      limit,
      offset,
    };
  }

  /**
   * Deletes a URL and all associated analytics cascade.
   */
  public static async deleteUrl(id: string): Promise<boolean> {
    const existing = await prisma.url.findUnique({
      where: { id },
    });

    if (!existing) {
      return false;
    }

    await prisma.url.delete({
      where: { id },
    });

    logger.info('URL deleted', { id, shortCode: existing.shortCode });
    return true;
  }
}
