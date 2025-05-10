# Use a Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Add build argument
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install typescript -g

RUN npm install

RUN npm install @prisma/client

# Copy the application code
COPY . .

# Add the wait-for-it.sh script
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# (Optional) Expose the port for documentation purposes
EXPOSE 8080

# Start the application
CMD ["sh", "entrypoint.sh"]
