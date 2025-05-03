import { Kafka, Producer } from "kafkajs";
import {  KAFKA_BROKER} from './config';
import prismaClient from "./prisma";
const kafka = new Kafka({
  clientId: "kafka-client",
  brokers: [KAFKA_BROKER || "localhost:9094"],
});

let producer: null | Producer = null;

export async function createProducer() {
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function produceMessage(message: string ,senderId:string ,roomId:string) {
  const producer = await createProducer();
  const messages = JSON.stringify({
    message,
    senderId,
    roomId,
  });
  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: messages }],
    topic: "MESSAGES",
  });
  return true;
}

export async function startMessageConsumer() {
  console.log("Consumer is running..");
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;
      try {
        console.log("started consuming");

        await prismaClient.message.create({
          data: {
            message:JSON.parse(message.value.toString()).message,
            sendId: parseInt(JSON.parse(message.value.toString()).senderId, 10),
            roomId: parseInt(JSON.parse(message.value.toString()).roomId, 10),
          },
        });
        console.log("Message consumed and saved to DB");        
      } catch (err) {
        console.log("Something is wrong",err);
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
}

export async function printDb() {
  try {
    const res = await prismaClient.message.findMany({})
    console.log("DB",res);
    
  } catch (error) {
    console.log(error);
    
  }
}
export default kafka;