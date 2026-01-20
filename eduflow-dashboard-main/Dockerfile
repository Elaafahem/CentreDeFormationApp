# Stage 1: Build phase
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build for production
RUN npm run build

# Stage 2: Serve phase with Nginx
FROM nginx:stable-alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional, default is usually ok for simple SPA)
# EXPOSE 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
