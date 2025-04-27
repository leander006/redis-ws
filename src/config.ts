import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 8080;
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const REDIS_USERNAME = process.env.REDIS_USERNAME;

