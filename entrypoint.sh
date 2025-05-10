#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
wait-for-it ${POSTGRES_HOST}:${POSTGRES_PORT} --timeout=30 --strict -- echo "PostgreSQL is up"

# Run migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
npm run dev

# Start the application
echo "Seeding the database..."
npm run seed
