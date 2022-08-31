const env = process.env.NODE_ENV || 'development';

const config = {
        development: {
            port: process.env.PORT || 8081,
            dbURL: process.env.DATABASE_API_URL,
            origin: ['http://localhost:5555', 'http://localhost:4200'],
        },
        production: {
            port: process.env.PORT || 8080,
            dbURL: process.env.DATABASE_API_URL,
            origin: "*",
        }
}
exports.config = config;
