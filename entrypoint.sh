#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
/usr/local/bin/wait-for-it postgres:5432 --timeout=30 --strict -- echo "PostgreSQL is up and running."


echo "Running Prisma migrations..."
npm run prisma:migrate 

if [ ! -f "/app/seeded.lock" ]; then
  echo "Seeding database with test data..."
  npm run prisma:seed
  touch /app/seeded.lock
else
  echo "Database already seeded, skipping..."
fi

echo "Building the application..."
npm run build

echo "Starting the application..."
exec "$@"
