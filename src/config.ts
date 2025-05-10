import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 8080;
export const RESTPORT = process.env.RESTPORT || 8080;
export const REDIS_PORT = process.env.REDIS_PORT;
export const REDIS_HOST = process.env.REDIS_HOST;
export const KAFKA_BROKER = process.env.KAFKA_BROKER;
export const JWT_SECRET = process.env.JWT_SECRET;