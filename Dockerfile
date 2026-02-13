# ---- Build stage (TypeScript -> JS) ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy sources and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build


# ---- Runtime stage (small Alpine image) ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled server
COPY --from=build /app/dist ./dist

# Copy static site
COPY public ./public

EXPOSE 3000
CMD ["npm", "start"]
