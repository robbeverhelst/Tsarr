FROM oven/bun:1.4.4-slim AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY dist/ dist/

FROM oven/bun:1.4.4-slim
RUN groupadd --system tsarr && useradd --system --gid tsarr --home-dir /app --no-create-home tsarr
WORKDIR /app
COPY --from=build --chown=tsarr:tsarr /app/node_modules node_modules
COPY --from=build --chown=tsarr:tsarr /app/dist dist
COPY --from=build --chown=tsarr:tsarr /app/package.json package.json
USER tsarr
ENTRYPOINT ["bun", "run", "dist/cli/index.js"]
