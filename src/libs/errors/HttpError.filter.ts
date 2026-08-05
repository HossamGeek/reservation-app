import 'dotenv/config';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger: Logger;
  constructor(private readonly i18n: I18nService) {
    this.logger = new Logger();
  }
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const exceptionError: Record<string, unknown> | undefined = exception["error"];

    if (exceptionError) {
      let errorVal = exceptionError.error;
      if (typeof errorVal === 'string') {
        const normalizedKey = `common.errors.${errorVal.replace(/\s+/g, '')}`;
        const translatedError = this.i18n.t(normalizedKey);
        if (translatedError && translatedError !== normalizedKey) {
          errorVal = translatedError;
        }
      }
      response.status(Number(exceptionError.statusCode)).json({
        status: exceptionError.statusCode,
        errors: errorVal
      });
      return;
    }


    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message || exception.message['error']
        : 'Internal server error';

    const devErrorResponse = {
      status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      source: request.constructor.name,
      errorName: exception?.name,
      message: exception?.message,
    };

    const prodErrorResponse = {
      status,
      message,
    };

    const responseData =
      process.env.NODE_ENV === 'DEV'
        ? devErrorResponse
        : prodErrorResponse;

    this.logger.log(
      `request method: ${request.method} request url${request.url}`,
      JSON.stringify(responseData),
    );


    let errors = exception instanceof HttpException
      ? exception.getResponse() : { error: 'internal server error' };

    if (typeof errors === 'string') {
      errors = { message: errors };
    } else if (errors && typeof errors === 'object') {
      errors = { ...errors };
    }

    if (errors && typeof errors === 'object') {
      const errorStr = (errors as Record<string, unknown>).error;
      if (typeof errorStr === 'string') {
        const normalizedKey = `common.errors.${errorStr.replace(/\s+/g, '')}`;
        const translatedError = this.i18n.t(normalizedKey);
        if (translatedError && translatedError !== normalizedKey) {
          (errors as Record<string, unknown>).error = translatedError;
        }
      }
    }

    response.status(status).json({
      status,
      errors
    });
  }
}
