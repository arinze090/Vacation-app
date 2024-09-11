# Use the official Node.js image as the base image
FROM node:18-alpine

# Set environment variable
ENV NODE_OPTIONS=--openssl-legacy-provider

# Set the working directory in the containers
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that the server will run on
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
