# Use the official Node.js image as the base image
FROM node:18-alpine as build

# Set environment variable
ENV NODE_OPTIONS=--openssl-legacy-provider

# Set the working directory in the containersss
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Use nginx as the base image for serving the built files
FROM nginx:alpine

# Copy the build output from the previous step to nginx's html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
