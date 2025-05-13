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
const ws_1 = require("ws");
const redis_1 = require("redis");
const config_1 = require("./config");
const kafka_1 = require("./kafka");
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("./prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// @ts-ignore
app.post('/api/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        const user = yield prisma_1.default.user.findUnique({
            where: { name: username },
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username' });
        }
        if (!user.password) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Password not matching' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.get('/api/rooms/:roomId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.params;
    const messages = yield prisma_1.default.message.findMany({
        where: {
            roomId: roomId,
        },
        include: {
            user: true,
        },
    });
    res.json(messages);
}));
app.get('/api/rooms', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rooms = yield prisma_1.default.room.findMany({
        include: {
            users: true,
        },
    });
    res.json(rooms);
}));
app.listen(config_1.RESTPORT, () => {
    console.log(`Server is running on http://localhost:${config_1.RESTPORT}`);
});
const publishClient = (0, redis_1.createClient)({
    socket: {
        host: config_1.REDIS_HOST || 'redis',
        port: config_1.REDIS_PORT ? parseInt(config_1.REDIS_PORT, 10) : 6379,
    },
});
publishClient.connect();
const subscribeClient = (0, redis_1.createClient)({
    socket: {
        host: config_1.REDIS_HOST || 'redis',
        port: config_1.REDIS_PORT ? parseInt(config_1.REDIS_PORT, 10) : 6379,
    },
});
subscribeClient.connect();
const wss = new ws_1.WebSocketServer({ port: Number(config_1.PORT) });
const subscriptions = {};
wss.on('connection', function connection(ws, req) {
    var _a;
    const params = new URLSearchParams((_a = req.url) === null || _a === void 0 ? void 0 : _a.split('?')[1]);
    const userId = params.get('userId') || random();
    console.log("New connection", userId);
    ws.send(JSON.stringify({ type: "connected", userId }));
    subscriptions[userId] = {
        ws,
        rooms: []
    };
    ws.on('message', function message(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const parseMesaage = JSON.parse(data.toString());
            const { type, roomId } = parseMesaage;
            if (type === 'subscribe') {
                subscriptions[userId].rooms.push(roomId);
                if (oneUserSubscribedTo(roomId)) {
                    console.log("subscribing on the pub sub to room " + roomId);
                    subscribeClient.subscribe(roomId, (messages) => __awaiter(this, void 0, void 0, function* () {
                        for (const key in subscriptions) {
                            const { ws, rooms } = subscriptions[key];
                            const { message, senderId, roomId } = JSON.parse(messages);
                            if ((rooms.includes(roomId)) && (key !== senderId.toString())) {
                                ws.send(JSON.stringify({ type: 'message', roomId, message }));
                            }
                        }
                    }));
                }
            }
            if (type === 'unsubscribe') {
                subscriptions[userId].rooms = subscriptions[userId].rooms.filter((room) => room !== roomId);
                if (lastPersonLeftRoom(roomId)) {
                    console.log("unsubscribing from pub sub on room" + roomId);
                    subscribeClient.unsubscribe(roomId);
                }
            }
            if (parseMesaage.type === "sendMessage") {
                const { roomId, message } = parseMesaage;
                console.log("Sending messages ", roomId, message, userId);
                const data = {
                    type: "message",
                    roomId,
                    message,
                    senderId: userId
                };
                publishClient.publish(roomId, JSON.stringify(data));
                yield (0, kafka_1.produceMessage)(message, userId.toString(), roomId);
                console.log("existing Sending messages");
            }
        });
    });
});
function oneUserSubscribedTo(roomId) {
    let totalInterestedPeople = 0;
    Object.keys(subscriptions).map(userId => {
        if (subscriptions[userId].rooms.includes(roomId)) {
            totalInterestedPeople++;
        }
    });
    if (totalInterestedPeople == 1) {
        return true;
    }
    return false;
}
function lastPersonLeftRoom(roomId) {
    let totalInterestedPeople = 0;
    Object.keys(subscriptions).map(userId => {
        if (subscriptions[userId].rooms.includes(roomId)) {
            totalInterestedPeople++;
        }
    });
    if (totalInterestedPeople == 0) {
        return true;
    }
    return false;
}
const random = () => {
    return Math.floor(Math.random() * 1000000);
};
