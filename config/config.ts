export const getEnvironmentVariable = (name: string): string => {
    const env = process.env[name];
    if (!env) {
        throw new Error(`Couldn't find environment variable: ${name}`);
    }
    return env;
};

export const PORT = getEnvironmentVariable('PORT');
export const DATABASE_URL = getEnvironmentVariable('DATABASE_URL');
export const DATABASE_NAME = getEnvironmentVariable('DATABASE_NAME');
export const COINGECKO_API_URL = getEnvironmentVariable('COINGECKO_API_URL');

const config = {
    development: {
        port: PORT || 8081,
        dbURL:DATABASE_URL,
        origin: ['http://localhost:5555', 'http://localhost:4200'],
    },
    production: {
        port: PORT || 8080,
        dbURL: DATABASE_URL,
        origin: "*",
    }
}

exports.config = config;

