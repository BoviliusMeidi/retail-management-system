import { AsyncLocalStorage } from "async_hooks";
import { DEFAULT_LANG, SupportedLang } from "@repo/shared";

export interface RequestContextStore {
    traceId: string;
    lang: SupportedLang
}

export class RequestContext {
    private static readonly storage = new AsyncLocalStorage<RequestContextStore>();

    static run<T>(store: RequestContextStore, callback: () => T): T {
        return this.storage.run(store, callback);
    }

    static getStore(): RequestContextStore | undefined {
        return this.storage.getStore();
    }

    static getTraceId(): string {
        return this.storage.getStore()?.traceId ?? "SYSTEM";
    }

    static getLang(): SupportedLang {
        return this.storage.getStore()?.lang ?? DEFAULT_LANG;
    }
}