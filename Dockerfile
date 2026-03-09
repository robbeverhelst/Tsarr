FROM oven/bun:slim AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY dist/ dist/

FROM oven/bun:slim
WORKDIR /app
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/dist dist
COPY --from=build /app/package.json package.json
ENTRYPOINT ["bun", "run", "dist/cli/index.js"]
