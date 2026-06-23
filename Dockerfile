# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build --configuration=production

# Stage 2: Serve the application using Nginx
FROM nginx:alpine
# Copy the built artifacts from the build stage to Nginx's web root
COPY --from=build /app/dist/ai-training-system-ui/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
