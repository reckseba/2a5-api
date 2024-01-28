FROM node:18-alpine AS base

######################################################################################
# 1. Install dependencies only when needed
FROM base AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

######################################################################################
# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY components ./components
COPY lib ./lib
COPY pages ./pages
COPY prisma ./prisma
COPY public ./public
COPY styles ./styles
COPY .eslintrc.json next.config.js package-lock.json package.json postcss.config.js tailwind.config.js tsconfig.json ./
COPY .env.development.docker.local ./.env
RUN npm run prismagenerate
RUN npm run build

######################################################################################
# 3. Production image, copy all the files and run next
FROM base AS runnerDevelopment
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma-client ../prisma-client

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]

######################################################################################
FROM base AS runnerBuild
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY build ./

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]

######################################################################################
FROM base AS depsAdmin
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY admin/package.json admin/yarn.lock* admin/package-lock.json* admin/pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

######################################################################################
# 2. Rebuild the source code only when needed
FROM base AS builderAdmin
WORKDIR /app
COPY --from=depsAdmin /app/node_modules ./admin/node_modules
COPY admin/public ./admin/public
COPY admin/views ./admin/views
COPY prisma ./admin/prisma
COPY .eslintrc.json admin/package-lock.json admin/package.json admin/tsconfig.json admin/index.ts ./admin/
COPY .env.development.docker.local ./admin/.env
WORKDIR /app/admin
RUN npm run prismagenerate
RUN cp -R prisma-client/ ../
RUN npm run build

######################################################################################
# 3. Production image, copy all the files and run next
FROM base AS runnerDevelopmentAdmin
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S adminjs
RUN adduser -S adminjs -u 1001

COPY --from=depsAdmin /app/node_modules ./admin/node_modules
COPY --from=builderAdmin /app/admin/public ./admin/public
COPY --from=builderAdmin /app/admin/views ./admin/views
COPY --from=builderAdmin /app/prisma-client ./prisma-client
COPY --from=builderAdmin /app/admin/index.js ./admin/index.js
COPY .env.development.docker.local ./admin/.env
COPY .env.development.docker.local ./.env

USER adminjs

EXPOSE 8001

ENV PORT 8001
WORKDIR /app/admin
CMD ["node", "index.js"]
