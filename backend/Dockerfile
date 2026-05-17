# Stage 1

# Use Node.js
FROM node:20-alpine AS builder

#set working directory
WORKDIR /app

# copy package.json and package-lock.json
#Docker cache this layer if the file have not changed
# In that way, mpm install does not run at every build
COPY package*.json ./

#Install all dependencies
RUN npm ci

#copy the rest of the files
COPY . .

# Stage 2 - production
# Final image
FROM node:20-alpine as production

#set NODE_ENV to prod
ENV NODE_ENV=production

#create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# set working dir
WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json ./

# install only production dependencies
RUN npm ci --only=production

#copy the code from builder stage
COPY --from=builder /app/src ./src

#change the files ownership to the non-root user
RUN chown -R nodeuser:nodejs /app

#use non-root
USER nodeuser

#expose the port
EXPOSE 4000

#health check - kubernetes uses it for liveness probe
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

#start the app
CMD ["node","src/index.js"]