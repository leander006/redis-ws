"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REDIS_USERNAME = exports.REDIS_PASSWORD = exports.REDIS_PORT = exports.REDIS_HOST = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT || 8080;
exports.REDIS_HOST = process.env.REDIS_HOST;
exports.REDIS_PORT = process.env.REDIS_PORT;
exports.REDIS_PASSWORD = process.env.REDIS_PASSWORD;
exports.REDIS_USERNAME = process.env.REDIS_USERNAME;
