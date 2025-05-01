"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KAFKA_BROKER = exports.REDIS_HOST = exports.REDIS_PORT = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT || 8080;
exports.REDIS_PORT = process.env.REDIS_PORT;
exports.REDIS_HOST = process.env.REDIS_HOST;
exports.KAFKA_BROKER = process.env.KAFKA_BROKER;
