# Use a Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install typescript -g

RUN npm install

RUN npm install @prisma/client

# Copy the application code
COPY . .

COPY wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

# (Optional) Expose the port for documentation purposes
EXPOSE 8080

# Start the application
CMD ["./entrypoint.sh", "npm", "start"]
