FROM node:21.1.0-alpine

WORKDIR /trust_it

# Copy package files
COPY frontend/package*.json frontend/yarn.lock ./

# Install dependencies with platform-specific handling for sharp
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && yarn config set network-timeout 300000 \
    && yarn install --frozen-lockfile --network-timeout 300000 \
    && apk del .build-deps

# Copy frontend files (excluding node_modules)
COPY frontend/ ./

# Build the application
RUN yarn build

# Run the application
CMD ["yarn", "start"] 