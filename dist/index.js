"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const redis_1 = require("redis");
const config_1 = require("./config");
const publishClient = (0, redis_1.createClient)({
    username: config_1.REDIS_USERNAME,
    password: config_1.REDIS_PASSWORD,
    socket: {
        host: config_1.REDIS_HOST,
        port: config_1.REDIS_PORT ? Number(config_1.REDIS_PORT) : undefined
    }
});
publishClient.connect();
const subscribeClient = (0, redis_1.createClient)({
    username: config_1.REDIS_USERNAME,
    password: config_1.REDIS_PASSWORD,
    socket: {
        host: config_1.REDIS_HOST,
        port: config_1.REDIS_PORT ? Number(config_1.REDIS_PORT) : undefined
    }
});
subscribeClient.connect();
const wss = new ws_1.WebSocketServer({ port: Number(config_1.PORT) });
const subscriptions = {};
wss.on('connection', function connection(ws) {
    const id = random();
    console.log("new connection", id);
    ws.send(JSON.stringify({ type: "connected", id }));
    subscriptions[id] = {
        ws,
        rooms: []
    };
    ws.on('message', function message(data) {
        const parseMesaage = JSON.parse(data.toString());
        const { type, roomId } = parseMesaage;
        if (type === 'subscribe') {
            subscriptions[id].rooms.push(roomId);
            if (oneUserSubscribedTo(roomId)) {
                console.log("subscribing on the pub sub to room " + roomId);
                subscribeClient.subscribe(roomId, (messages) => {
                    for (const key in subscriptions) {
                        const { ws, rooms } = subscriptions[key];
                        const { message, senderId } = JSON.parse(messages);
                        if ((rooms.includes(roomId)) && (key !== senderId.toString())) {
                            ws.send(JSON.stringify({ type: 'message', roomId, message }));
                        }
                    }
                });
            }
        }
        if (type === 'unsubscribe') {
            subscriptions[id].rooms = subscriptions[id].rooms.filter((room) => room !== roomId);
            if (lastPersonLeftRoom(roomId)) {
                console.log("unsubscribing from pub sub on room" + roomId);
                subscribeClient.unsubscribe(roomId);
            }
        }
        if (parseMesaage.type = "sendMessage") {
            const { roomId, message } = parseMesaage;
            const data = {
                type: "message",
                roomId,
                message,
                senderId: id
            };
            publishClient.publish(roomId, JSON.stringify(data));
        }
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
