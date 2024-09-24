# Use the official Node.js image as the base image
# From my knowledge, the usage of "alpine" helps compress the size of the built docker image
# Else we could see a docker image size of over 100MB but with this, our built image would be lesser than 100MB
FROM node:18-alpine as build

# Set environment variable
ENV NODE_OPTIONS=--openssl-legacy-provider

# Set the working directory in the containersss
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# This here installs the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Use nginx as the base image for serving the built files
FROM nginx:alpine

# Copy the build output from the previous step to nginx's html directory
COPY --from=build /app/build /usr/share/nginx/html

# We expose the port to 80 to the outside world
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
