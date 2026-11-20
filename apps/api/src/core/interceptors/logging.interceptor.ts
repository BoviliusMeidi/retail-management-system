import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { AppLoggerService } from "../logger/app-logger.service.js";
import { Observable, tap } from "rxjs";
import { Request, Response } from "express";
import { sanitizePayload } from "../logger/log-sanitizer.js";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: AppLoggerService){}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        if(context.getType() !== 'http') return next.handle();

        const http = context.switchToHttp();
        const req = http.getRequest<Request>();
        const res = http.getResponse<Response>();
        const startTime = performance.now();

        const handlerContext = `${context.getClass().name}#${context.getHandler().name}`;
        const input = sanitizePayload({
            params: req.params,
            query: req.query,
            Body: req.body,
        })

        return next.handle().pipe(
            tap((responseData: unknown) => {
                const durationMs = Number((performance.now() - startTime).toFixed(2));

                this.logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms`,
                    {
                        input,
                        output: sanitizePayload(responseData),
                        statusCode: res.statusCode,
                        durationMs
                    },
                    handlerContext,
                );
            }),
        );
    }
}