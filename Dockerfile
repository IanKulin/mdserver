# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Copy the rest of the application source code to the container
COPY ./server.js .
COPY ./LICENSE .
COPY ./readme.md .



# Expose the port that the Node.js app will listen on
EXPOSE 3000

# Define the command to start your Node.js app
CMD [ "node", "server.js" ]
