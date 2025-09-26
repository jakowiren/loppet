FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (same as Vercel)
RUN npm install

# Copy source code (but exclude dist if it exists locally)
COPY . .

# Remove any local dist directory to ensure clean build
RUN rm -rf dist

# Set build-time environment variables for Vite
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Build the application (same as Vercel)
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Expose port 8080
EXPOSE 8080

# Serve the built files from dist directory (same as Vercel)
# -s flag enables SPA mode (all routes serve index.html)
CMD ["serve", "-s", "dist", "-l", "8080", "--no-clipboard"]