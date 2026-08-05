# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files to install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Serve stage
FROM node:22-alpine

WORKDIR /app

# Copy the necessary files from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src

# Expose the API port
EXPOSE 5505

# Start the application
CMD ["node", "dist/main"]
