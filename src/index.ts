import { WebSocketServer,WebSocket } from 'ws';
import { createClient } from 'redis';
import { PORT,REDIS_PORT,REDIS_HOST, RESTPORT} from './config';
import { produceMessage, startMessageConsumer } from './kafka';
import express from 'express';
import prismaClient from './prisma';
import bcrypt from "bcrypt"
const app = express();
app.use(express.json());


// @ts-ignore
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await prismaClient.user.findUnique({
            where: { name: username },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username' });
          }
      
          if (!user.password) {
            return res.status(401).json({ message: 'Invalid password' });
          }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Password not matching' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/api/rooms/:roomId', async (req, res) => {
    const { roomId } = req.params;
    const messages = await prismaClient.message.findMany({
        where: {
            roomId: roomId,
        },
        include: {
            user: true,
        },
    });
    res.json(messages);
});

app.get('/api/rooms', async (req, res) => {
    const rooms = await prismaClient.room.findMany({
        include: {
            users: true,
        },
    });
    res.json(rooms);
});

app.listen(RESTPORT, () => {
    console.log(`Server is running on http://localhost:${RESTPORT}`);
});

const publishClient = createClient({
    socket: {
        host: REDIS_HOST || 'redis', 
        port: REDIS_PORT ? parseInt(REDIS_PORT, 10) : 6379,
    },
});

publishClient.connect()
const subscribeClient = createClient({
        socket: {
        host: REDIS_HOST || 'redis', 
        port: REDIS_PORT ? parseInt(REDIS_PORT, 10) : 6379,
    },
});

subscribeClient.connect()
    
const wss = new WebSocketServer({ port: Number(PORT) });

const subscriptions : {[key:string]:{ 
    ws: WebSocket,
    rooms: String[]
}} ={

}

wss.on('connection', function connection(ws,req) {
    const params = new URLSearchParams(req.url?.split('?')[1]);
    const userId = params.get('userId') || random();
  
    console.log("New connection", userId);
    ws.send(JSON.stringify({ type: "connected", userId }));
  
    subscriptions[userId] = {
      ws,
      rooms: []
    };
  ws.on('message',async function message(data) {
    const parseMesaage = JSON.parse(data.toString())
    
    const { type, roomId } = parseMesaage
    
    if(type === 'subscribe'){
        subscriptions[userId].rooms.push(roomId)
        if (oneUserSubscribedTo(roomId)) {
            console.log("subscribing on the pub sub to room " + roomId);
            subscribeClient.subscribe(roomId, async (messages) => {
                for(const key in subscriptions){
                    const {ws,rooms} = subscriptions[key]
                    const { message ,senderId ,roomId} = JSON.parse(messages)
                    if ((rooms.includes(roomId)) && (key !== senderId.toString())) {
                        console.log("Sending message to user " + key);
                        ws.send(JSON.stringify({ type: 'message', roomId, message }))                
                    }
                }
            })
        }
    }
    if(type === 'unsubscribe'){
        subscriptions[userId].rooms = subscriptions[userId].rooms.filter((room) => room !== roomId)
        if (lastPersonLeftRoom(roomId)) {
            console.log("unsubscribing from pub sub on room" + roomId);
            subscribeClient.unsubscribe(roomId);
        }
    }
    if(parseMesaage.type === "sendMessage"){        
        const { roomId, message } = parseMesaage
        const data = {
            type: "message",
            roomId,
            message,
            senderId: userId
        }
        publishClient.publish(roomId, JSON.stringify(data));
        await produceMessage(message, userId.toString(), roomId);
    }
  });
});

function oneUserSubscribedTo(roomId: string) {
    let totalInterestedPeople = 0;
    Object.keys(subscriptions).map(userId => {
        if (subscriptions[userId].rooms.includes(roomId)) {
            totalInterestedPeople++;
        }
    })
    if (totalInterestedPeople == 1) {
        return true;
    }
    return false;
}

function lastPersonLeftRoom(roomId: string) {
    let totalInterestedPeople = 0;
    Object.keys(subscriptions).map(userId => {
        if (subscriptions[userId].rooms.includes(roomId)) {
            totalInterestedPeople++;
        }
    })
    if (totalInterestedPeople == 0) {
        return true;
    }
    return false;
}

startMessageConsumer()

const random = () => {
    return Math.floor(Math.random() * 1000000);
}
