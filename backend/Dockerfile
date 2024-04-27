FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Install app dependencies using cache effectively
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY --chown=node:node package*.json ./

RUN npm ci --omit=dev

# Copy the rest of the application source
COPY --chown=node:node . .

# Environment variables
ENV PORT=8000 TZ=Europe/Vienna NODE_ENV=production

# Non-root user for better security
USER node

# Start the application
CMD [ "node","src/index.js" ]