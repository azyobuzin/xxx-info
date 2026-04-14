# apps/apiをCloud Run向けにビルドします

FROM node:24-slim AS base
RUN corepack enable pnpm

FROM base AS deploy
WORKDIR /src
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/ apps/api/
RUN echo "inject-workspace-packages=true" > .npmrc && \
    pnpm deploy --filter=@xxx-info/api --prod /app

FROM node:24-slim
WORKDIR /app
COPY --from=deploy /app .
ENV NODE_ENV=production
CMD ["node", "src/server.ts"]
