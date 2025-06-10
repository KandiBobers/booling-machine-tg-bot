# Use official Node.js image as base
FROM node:20-alpine

# Create and set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY src ./src

# Build the project
RUN npm run build

# Expose the port your app runs on (if needed)
# EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]