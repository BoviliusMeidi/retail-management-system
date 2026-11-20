import { RequestContext } from "../context/request-context.js";
import { AppLoggerService } from "../logger/app-logger.service.js";
import { sanitizePayload } from "../logger/log-sanitizer.js";

const logger = new AppLoggerService();

export function TraceLog(): MethodDecorator {
    return (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ): PropertyDescriptor => {
        const originalMethod = descriptor.value as (...args: unknown[]) => unknown;
        const className = target.constructor.name;
        const methodName = String(propertyKey);
        const context = `${className}#${methodName}`;

        descriptor.value = function (...args: unknown[]) {
            const startTime = performance.now();
            const input = sanitizePayload(args);

            try {
                const result = originalMethod.apply(this, args);
                if(result instanceof Promise) {
                    return result
                        .then((resolveValue: unknown) => {
                            const durationMs = Number((performance.now() - startTime).toFixed(2),);
                            logger.log(`Executed in ${durationMs}ms`, {input, output: sanitizePayload(resolveValue), durationMs}, context);
                            return resolveValue;
                        })
                        .catch((error: unknown) => {
                            const durationMs = Number((performance.now() - startTime).toFixed(2),);
                            RequestContext.setErrorOrigin({origin: context, input, durationMs});
                            throw error;
                        })
                }

                const durationMs = Number((performance.now() - startTime).toFixed(2),);
                logger.log(`Executed in ${durationMs}ms`, {input, output: sanitizePayload(result), durationMs}, context);
                return result;
            } catch (error) {
                const durationMs = Number((performance.now() - startTime).toFixed(2),);
                RequestContext.setErrorOrigin({origin: context, input, durationMs});
                throw error;
            }
        }
        return descriptor;
    }
}