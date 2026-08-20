import { Request } from 'express';
import geoip from 'geoip-lite';

export interface RequestMetadata {
  country: string;
  referrer: string;
  ip: string;
}

export function extractClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.socket.remoteAddress || req.ip || '127.0.0.1';
}

export function extractCountry(req: Request): string {
  // 1. Cloudflare header
  const cfCountry = req.headers['cf-ipcountry'];
  if (typeof cfCountry === 'string' && cfCountry.length === 2) {
    return cfCountry.toUpperCase();
  }

  // 2. CloudFront header
  const cfViewerCountry = req.headers['cloudfront-viewer-country'];
  if (typeof cfViewerCountry === 'string' && cfViewerCountry.length === 2) {
    return cfViewerCountry.toUpperCase();
  }

  // 3. GeoIP lookup based on client IP
  const ip = extractClientIp(req);
  if (ip && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
    const geo = geoip.lookup(ip);
    if (geo && geo.country) {
      return geo.country;
    }
  }

  return 'Unknown';
}

export function normalizeReferrer(req: Request): string {
  const rawReferrer = req.headers['referer'] || req.headers['referrer'];
  if (!rawReferrer || typeof rawReferrer !== 'string') {
    return 'Direct';
  }

  try {
    const parsed = new URL(rawReferrer);
    const host = parsed.hostname.replace(/^www\./, '');
    return host || 'Direct';
  } catch {
    return 'Direct';
  }
}

export function extractRequestMetadata(req: Request): RequestMetadata {
  return {
    country: extractCountry(req),
    referrer: normalizeReferrer(req),
    ip: extractClientIp(req),
  };
}
