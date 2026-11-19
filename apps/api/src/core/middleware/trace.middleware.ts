import { Injectable, NestMiddleware } from "@nestjs/common";
import { DEFAULT_LANG, isSupportedLang, SupportedLang, TRACE_ID_HEADER } from "@repo/shared";
import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";
import { RequestContext } from "../context/request-context.js";

@Injectable()
export class TraceMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
        const incomingTraceId = req.headers[TRACE_ID_HEADER];
        const traceId = typeof incomingTraceId === 'string' && incomingTraceId.trim().length > 0 ? incomingTraceId.trim() : randomUUID();
        const lang = this.resolveLanguage(req.headers['accept-language']);

        res.setHeader(TRACE_ID_HEADER, traceId);
        res.setHeader('content-language', lang);

        RequestContext.run({traceId, lang}, () => {
            next();
        });
    }

    private resolveLanguage(acceptLanguage: string | undefined): SupportedLang {
        if(!acceptLanguage) return DEFAULT_LANG;

        const primaryLang = acceptLanguage.split(',')[0]?.split('-')[0]?.toLowerCase();
        if(primaryLang && isSupportedLang(primaryLang)) return primaryLang;

        return DEFAULT_LANG;
    }
}