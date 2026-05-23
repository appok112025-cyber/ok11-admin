# Base stage with pnpm setup
FROM node:20-alpine AS base

WORKDIR /app

# Enable corepack and prepare pnpm (cached unless Node version changes)
RUN corepack enable && corepack prepare pnpm@9 --activate

# Dependencies stage - install all dependencies
FROM base AS deps

# Copy only dependency files (cached unless these files change)
COPY package.json pnpm-lock.yaml ./

# Install all dependencies including devDependencies (cached unless package files change)
RUN pnpm install --frozen-lockfile

# Build stage - build the application
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy TypeScript and Nuxt config files (cached unless config changes)
COPY tsconfig.json nuxt.config.ts tailwind.config.js ./

# Copy source code (only invalidates cache when source changes)
COPY app ./app
COPY server ./server
COPY public ./public

# Build the Nuxt application (only runs when source or config changes)
RUN pnpm run build

# Production dependencies stage
FROM base AS prod-deps

WORKDIR /app

# Copy only dependency files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only (cached unless package files change)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts && pnpm store prune

# Runtime stage - minimal production image
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

# Copy production dependencies from prod-deps stage
COPY --from=prod-deps --chown=nuxtjs:nodejs /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./

# Copy package.json for runtime metadata
COPY --from=builder --chown=nuxtjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nuxtjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the Nuxt server
CMD ["node", "server/index.mjs"]
