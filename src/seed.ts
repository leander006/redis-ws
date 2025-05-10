import bcrypt from 'bcrypt';
import prismaClient from './prisma';

async function main() {
  // Create Users
  const users = await prismaClient.user.createMany({
    data: [
      { name: 'Alice', email: 'alice@example.com',password: await bcrypt.hash('password1', 10)},
      { name: 'Bob', email: 'bob@example.com', password: await bcrypt.hash('password2', 10) },
      { name: 'Charlie', email: 'charlie@example.com', password: await bcrypt.hash('password3', 10) },
      { name: 'David', email: 'david@example.com',password: await bcrypt.hash('password123', 10)},
      { name: 'Eve', email: 'eve@example.com',password: await bcrypt.hash('password12', 10) },
    ],
    skipDuplicates: true,
  });

  console.log(`Created ${users.count} users.`);

  // Fetch created users
  const allUsers = await prismaClient.user.findMany();

  // Create Rooms
  const roomData = [
    { name: 'Room 1', userIds: [allUsers[0].id, allUsers[1].id] },
    { name: 'Room 2', userIds: [allUsers[2].id, allUsers[3].id, allUsers[4].id] },
    { name: 'Room 3', userIds: [allUsers[0].id, allUsers[4].id] },
  ];

  for (const room of roomData) {
    const createdRoom = await prismaClient.room.create({
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

    await prismaClient.message.createMany({
      data: messages,
    });

    console.log(`Added ${conversation.length} messages to ${room.name}.`);
  }
}

main()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });
