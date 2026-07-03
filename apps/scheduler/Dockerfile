FROM node:22-alpine

WORKDIR /app

# Copy only manifest files first (better caching, avoids pulling in host node_modules)
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/worker/package*.json ./apps/worker/
COPY apps/scheduler/package*.json ./apps/scheduler/
COPY packages/database/package*.json ./packages/database/
COPY packages/observability/package*.json ./packages/observability/
COPY packages/shared/package*.json ./packages/shared/


# Now copy source code (node_modules excluded via .dockerignore)
COPY . .

RUN npm install

RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

RUN npm run build

CMD ["node", "apps/scheduler/dist/index.js"]