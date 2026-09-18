FROM node:24.21.0 AS builder
WORKDIR /app

COPY package*.json ./

RUN npm install -g pnpm && \
    pnpm install

COPY . .
RUN pnpm run build

FROM node:24.21.0
WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV PORT=3000
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]