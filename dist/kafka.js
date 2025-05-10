"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProducer = createProducer;
exports.produceMessage = produceMessage;
exports.startMessageConsumer = startMessageConsumer;
exports.printDb = printDb;
const kafkajs_1 = require("kafkajs");
const prisma_1 = __importDefault(require("./prisma"));
const kafka = new kafkajs_1.Kafka({
    clientId: "kafka-client",
    brokers: ["localhost:9092"],
});
let producer = null;
function createProducer() {
    return __awaiter(this, void 0, void 0, function* () {
        if (producer)
            return producer;
        const _producer = kafka.producer();
        yield _producer.connect();
        producer = _producer;
        return producer;
    });
}
function produceMessage(message, senderId, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const producer = yield createProducer();
        const messages = JSON.stringify({
            message,
            senderId,
            roomId,
        });
        yield producer.send({
            messages: [{ key: `message-${Date.now()}`, value: messages }],
            topic: "MESSAGES",
        });
        return true;
    });
}
function startMessageConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Consumer is running..");
        const consumer = kafka.consumer({ groupId: "default" });
        yield consumer.connect();
        yield consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });
        yield consumer.run({
            autoCommit: true,
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ message, pause }) {
                if (!message.value)
                    return;
                try {
                    console.log("started consuming");
                    yield prisma_1.default.message.create({
                        data: {
                            content: JSON.parse(message.value.toString()).message,
                            userId: JSON.parse(message.value.toString()).senderId,
                            roomId: JSON.parse(message.value.toString()).roomId
                        },
                    });
                    console.log("Message consumed and saved to DB");
                }
                catch (err) {
                    console.log("Something is wrong", err);
                    pause();
                    setTimeout(() => {
                        consumer.resume([{ topic: "MESSAGES" }]);
                    }, 60 * 1000);
                }
            }),
        });
    });
}
function printDb() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield prisma_1.default.message.findMany({});
            console.log("DB", res);
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.default = kafka;
