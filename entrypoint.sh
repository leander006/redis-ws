#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
/usr/local/bin/wait-for-it postgres:5432 --timeout=30 --strict -- echo "PostgreSQL is up and running."


echo "Running Prisma migrations..."
npm run prisma:migrate 

echo "Seeding database with test data..."
npm run prisma:seed

echo "Building the application..."
npm run build

echo "Starting the application..."
exec "$@"
