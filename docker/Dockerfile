FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --production

# Copy source code
COPY src/ ./src/
COPY dist/ ./dist/

# Set default command
CMD ["bun", "run", "dist/index.js"]