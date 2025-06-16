# Use the official Node.js 20 runtime as a parent image
FROM node:20-alpine

# Install necessary packages
RUN apk add --no-cache python3 make g++

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Expose the port the app runs on
EXPOSE 3001

# Start the application with migrations
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
