# Use a Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

RUN npm install typescript -g

# Copy the application code
COPY . .


# (Optional) Expose the port for documentation purposes
EXPOSE 8080

# Start the application
CMD ["npm", "run", "dev"] 
