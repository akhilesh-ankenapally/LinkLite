type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private format(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.log(this.format('info', message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.format('warn', message, context));
  }

  error(message: string, context?: Record<string, unknown>): void {
    console.error(this.format('error', message, context));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('debug', message, context));
    }
  }
}

export const logger = new Logger();
