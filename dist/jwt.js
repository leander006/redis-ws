"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const generateToken = (payload) => {
    if (!config_1.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    try {
        return jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET, { expiresIn: '1h' });
    }
    catch (_a) {
        throw new Error('Invalid token');
    }
};
exports.generateToken = generateToken;
function verifyToken(token) {
    if (!config_1.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        return decoded;
    }
    catch (_a) {
        throw new Error('Invalid token');
    }
}
