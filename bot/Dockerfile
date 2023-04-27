FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# set environment variables
ENV PORT=9000
ENV TZ=Europe/Vienna
ENV NODE_ENV=production

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node:node package*.json ./

RUN npm ci

# Bundle app source
COPY --chown=node:node . .

USER node

CMD [ "node","src/index.js" ]