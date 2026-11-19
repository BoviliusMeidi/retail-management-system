import 'dotenv/config';

export type NodeEnv = 'development' | 'production' | 'test';

function parseNodeEnv(value: string | undefined): NodeEnv {
    if(value === 'production' || value === 'test'){
        return value;
    }

    return 'development';
}

const nodeEnv = parseNodeEnv(process.env.NODE_ENV);

export const appConfig = {
    env: nodeEnv,
    isDev: nodeEnv === 'development',
    isProd: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    port: Number(process.env.PORT) || 3001,
} as const;