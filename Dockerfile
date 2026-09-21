FROM oven/bun:1.4.2 AS builder

WORKDIR /app

# Keep secrets and local build output out of the Docker build context via .dockerignore.
COPY . .

RUN bun install --frozen-lockfile

# These values are public and must be available while Next.js builds the browser bundle.
ARG NEXT_PUBLIC_API_BASE_URL=https://c9y3l3wuma.execute-api.ap-south-1.amazonaws.com/dev
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

RUN bun run --cwd web build \
  && mkdir -p web/.next/standalone/web/.next/static \
  && cp -RL web/.next/static/. web/.next/standalone/web/.next/static/

FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

# Next's standalone output preserves the monorepo runtime layout.
COPY --from=builder /app/web/.next/standalone ./

# Static browser assets are intentionally copied separately by Next's standalone guidance.
COPY --from=builder /app/web/.next/static ./web/.next/static

WORKDIR /app/web
EXPOSE 8080
CMD ["node", "server.js"]
