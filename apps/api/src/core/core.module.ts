import { Global, Module } from "@nestjs/common";
import { AppLoggerService } from "./logger/app-logger.service.js";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "./interceptors/logging.interceptor.js";

@Global()
@Module({
    providers: [
        AppLoggerService,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
    exports: [AppLoggerService],
})
export class CoreModule {}