# The base image
FROM node:20.16.0-alpine AS base
RUN apk add --no-cache bash
RUN corepack enable

# Stage 1: Dependencies
FROM base AS deps
WORKDIR /app

# First copy only the files needed for dependency installation
COPY package.json yarn.lock .yarnrc.yml .yarn/ ./

# Install dependencies with frozen lockfile
RUN yarn install --immutable --inline-builds

# Stage 2: Builder
FROM base AS builder
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY . .

# Build the application
RUN yarn build

# Stage 3: Production
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 nodejs && \
    adduser -u 1001 -G nodejs -s /bin/sh -D nextjs

WORKDIR /app

# Copy built assets from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.yarn ./.yarn
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Runtime configuration
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

EXPOSE 3000
USER nextjs:nodejs

CMD ["yarn", "start"]