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
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("./prisma"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create Users
        const users = yield prisma_1.default.user.createMany({
            data: [
                { name: 'Alice', email: 'alice@example.com', password: yield bcrypt_1.default.hash('password1', 10) },
                { name: 'Bob', email: 'bob@example.com', password: yield bcrypt_1.default.hash('password2', 10) },
                { name: 'Charlie', email: 'charlie@example.com', password: yield bcrypt_1.default.hash('password3', 10) },
                { name: 'David', email: 'david@example.com', password: yield bcrypt_1.default.hash('password123', 10) },
                { name: 'Eve', email: 'eve@example.com', password: yield bcrypt_1.default.hash('password12', 10) },
            ],
            skipDuplicates: true,
        });
        console.log(`Created ${users.count} users.`);
        // Fetch created users
        const allUsers = yield prisma_1.default.user.findMany();
        // Create Rooms
        const roomData = [
            { name: 'Room 1', userIds: [allUsers[0].id, allUsers[1].id] },
            { name: 'Room 2', userIds: [allUsers[2].id, allUsers[3].id, allUsers[4].id] },
            { name: 'Room 3', userIds: [allUsers[0].id, allUsers[4].id] },
        ];
        for (const room of roomData) {
            const createdRoom = yield prisma_1.default.room.create({
                data: {
                    name: room.name,
                    users: {
                        connect: room.userIds.map((id) => ({ id })),
                    },
                },
            });
            console.log(`Created ${createdRoom.name}.`);
            // Add conversational messages to each room
            const conversation = [
                "Hi everyone! How’s it going?",
                "Pretty good! How about you?",
                "Doing great, just working on a project.",
                "Sounds cool! What's the project about?",
                "It’s about creating a chat application.",
                "Oh nice, like WhatsApp?",
                "Kind of! It’s for a coding challenge.",
                "Good luck with it!",
                "Thanks! What are you up to?",
                "Just relaxing, watching a movie.",
            ];
            const messages = conversation.map((content, index) => ({
                content,
                roomId: createdRoom.id,
                userId: room.userIds[index % room.userIds.length],
            }));
            yield prisma_1.default.message.createMany({
                data: messages,
            });
            console.log(`Added ${conversation.length} messages to ${room.name}.`);
        }
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield prisma_1.default.$disconnect();
    process.exit(1);
}));
