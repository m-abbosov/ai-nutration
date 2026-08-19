import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SystemLogSeverity } from '@prisma/client';
import { Request, Response } from 'express';
import { PrismaService } from '../../database/prisma.service';

/**
 * Global exception filter. Normalizes every error into Nest's default
 * `{ statusCode, message, error }` shape (per API_CONTRACT.md) and never
 * leaks stack traces or internal error details to the client.
 *
 * Every error also gets one `SystemLog` row — `ERROR` for 5xx/unexpected,
 * `WARNING` for other 4xx — fired-and-forgotten so a logging hiccup never
 * delays or breaks the client-facing error response (docs/ADMIN_PANEL.md,
 * "Existing modules touched"). This is the general admin-panel log feed
 * (Settings → System → Logs), not just a 5xx error tracker.
 *
 * 401 is the one status intentionally never logged: an expired access
 * token is routine (every client silently refreshes and retries — see
 * packages/shared/src/api/client.ts), not signal an admin needs to see,
 * and would otherwise dominate the log volume.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  constructor(private readonly prisma: PrismaService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
        error = exception.name;
      } else if (typeof body === 'object' && body !== null) {
        const bodyObj = body as Record<string, unknown>;
        message = (bodyObj.message as string | string[]) ?? exception.message;
        error = (bodyObj.error as string) ?? exception.name;
      }
    } else if (exception instanceof Error) {
      // Unknown/unexpected error — log full detail server-side, but never
      // return internals (message/stack) to the client.
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `Unhandled non-Error exception on ${request.method} ${request.url}`,
      );
    }

    if (status !== HttpStatus.UNAUTHORIZED) {
      const severity: SystemLogSeverity = status >= 500 ? 'ERROR' : 'WARNING';
      // Fire-and-forget: never await inside catch(), never let this throw.
      void this.writeSystemLog(exception, request, status, severity);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
    });
  }

  private async writeSystemLog(
    exception: unknown,
    request: Request,
    status: number,
    severity: SystemLogSeverity,
  ): Promise<void> {
    const message =
      exception instanceof Error ? exception.message : 'Unknown error';
    const stack = exception instanceof Error ? (exception.stack ?? null) : null;
    try {
      await this.prisma.systemLog.create({
        data: {
          severity,
          service: 'api',
          message: `${request.method} ${request.url}: ${message}`,
          requestId: (request.headers['x-request-id'] as string) ?? null,
          statusCode: status,
          stack,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to write SystemLog: ${(err as Error).message}`);
    }
  }
}
