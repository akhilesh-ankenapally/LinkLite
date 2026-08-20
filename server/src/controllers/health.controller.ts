import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class HealthController {
  public static async getHealth(_req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    let dbStatus = 'disconnected';

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error';
    }

    const responseTime = Date.now() - startTime;
    const isHealthy = dbStatus === 'connected';

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'linklite-backend',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      latencyMs: responseTime,
      uptime: process.uptime(),
    });
  }
}
