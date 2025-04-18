FROM node:18-alpine as builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy source code and config
COPY tsconfig.json ./
COPY src ./src
COPY .env ./

# Build application
RUN pnpm build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install pnpm and only production dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

# Copy built files and .env from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./

# Expose port for the app
EXPOSE 3002

# Start the server
CMD ["node", "dist/src/server.js"]