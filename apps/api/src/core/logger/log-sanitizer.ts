const SENSITIVE_KEYS = new Set([
    'password',
    'pass',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'secret',
    'apikey',
])

export function sanitizePayload(data: unknown, depth = 0): unknown {
    if(depth > 4) return '[MAX_DEPTH]';
    if(data === null || data === undefined) return data;

    if(typeof data === 'string') return data.length > 300 ? `${data.slice(0, 300)}...[TRUNCATED]` : data;
    if(Array.isArray(data)) {
        const preview = data.slice(0, 10).map((item) => sanitizePayload(item, depth + 1));
        if(data.length > 10) preview.push(`...(${data.length - 10}) more items`);
        return preview;
    }
    if(typeof data === 'object') {
        const sanatize: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data as Record<string, unknown>)){
            if(SENSITIVE_KEYS.has(key.toLowerCase())) sanatize[key] = '[REDACTED]';
            else sanatize[key] = sanitizePayload(value, depth + 1);
        }
        return sanatize;
    }

    return data;
}