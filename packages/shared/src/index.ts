export const TRACE_ID_HEADER = "x-trace-id";

export const SUPPORTED_LANGS = ["en", "id"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: SupportedLang = 'en';

export function isSupportedLang(value: string): value is SupportedLang {
    return (SUPPORTED_LANGS as readonly string[]).includes(value);
}