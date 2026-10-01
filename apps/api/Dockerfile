# Build from the repo root: docker build -f apps/api/Dockerfile .
FROM oven/bun:1.4.2 AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile --linker=hoisted

FROM oven/bun:1.4.2
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules node_modules
COPY packages/shared packages/shared
COPY apps/api apps/api
WORKDIR /app/apps/api
CMD ["bun", "src/index.ts"]
