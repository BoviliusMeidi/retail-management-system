import { Injectable, LoggerService } from "@nestjs/common";
import { appConfig } from "../config/app.config.js";
import { RequestContext } from "../context/request-context.js";

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'VERBOSE';

const ANSI = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    magenta: '\x1b[35m',
} as const;

const LEVEL_COLOR: Record<LogLevel, string> = {
    INFO: ANSI.green,
    WARN: ANSI.yellow,
    ERROR: ANSI.red,
    DEBUG: ANSI.cyan,
    VERBOSE: ANSI.magenta,
};

@Injectable()
export class AppLoggerService implements LoggerService {
    log(message: unknown, ...optionalParams: unknown[]): void {
        this.write('INFO', message, optionalParams);
    }

    warn(message: unknown, ...optionalParams: unknown[]): void {
        this.write('WARN', message, optionalParams);
    }

    error(message: unknown, ...optionalParams: unknown[]): void {
        this.write('ERROR', message, optionalParams);
    }

    debug(message: unknown, ...optionalParams: unknown[]): void {
        if(appConfig.isProd) return;
        this.write('DEBUG', message, optionalParams);
    }

    verbose(message: unknown, ...optionalParams: unknown[]): void {
        if(appConfig.isProd) return;
        this.write('VERBOSE', message, optionalParams);
    }

    private write(level: LogLevel, message: unknown, optionalParams: unknown[]): void {
        const timestamp = new Date().toISOString();
        const traceId = RequestContext.getTraceId();
        const {context, stack, meta} = this.parseParams(level, optionalParams);

        const output = appConfig.isProd
            ? this.formatJson({timestamp, level, traceId, context, message, meta, stack})
            : this.formatPretty({timestamp, level, traceId, context, message, meta, stack})

        if(level === 'ERROR') process.stderr.write(`${output}\n`)
        else process.stdout.write(`${output}\n`)
    }

    private parseParams(level: LogLevel, params: unknown[]): {context: string, stack?: string, meta?: Record<string, unknown>} {
        let context = 'Application';
        let stack: string | undefined;
        let meta: Record<string, unknown> | undefined;

        for(const param of params){
            if(typeof param === 'object' && param !== null) meta = param as Record<string, unknown>
            else if(typeof param === 'string') {
                if(level === 'ERROR' && param.includes('\n')) stack = param;
                else context = param;
            }
        }

        return {context, stack, meta};
    }

    private formatJson(payload: {
        timestamp: string;
        level: LogLevel;
        traceId: string;
        context: string;
        message: unknown;
        meta?: Record<string, unknown>;
        stack?: string;
    }): string {
        return JSON.stringify({
            timestamp: payload.timestamp,
            level: payload.level,
            traceId: payload.traceId,
            context: payload.context,
            message: payload.message,
            ...(payload.meta ? {meta: payload.meta} : {}),
            ...(payload.stack ? {stack: payload.stack} : {}),
        })
    }

    private formatPretty(payload: {
        timestamp: string;
        level: LogLevel;
        traceId: string;
        context: string;
        message: unknown;
        meta?: Record<string, unknown>;
        stack?: string;
    }): string {
        const color = LEVEL_COLOR[payload.level];
        const shortTrace = payload.traceId === 'SYSTEM' ? 'SYSTEM' : payload.traceId.slice(0, 8);
        const metaStr = payload.meta ? ` ${ANSI.dim}${JSON.stringify(payload.meta)}${ANSI.reset}` : '';
        const stackStr = payload.stack ? `\n${ANSI.red}${payload.stack}${ANSI.reset}` : '';

        return [
        `${ANSI.dim}[${payload.timestamp}]${ANSI.reset}`,
        `${color}${payload.level.padEnd(7)}${ANSI.reset}`,
        `${ANSI.cyan}[${shortTrace}]${ANSI.reset}`,
        `${ANSI.yellow}[${payload.context}]${ANSI.reset}`,
        `${String(payload.message)}${metaStr}${stackStr}`,
        ].join(' ');
    }
}
