FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# set environment variables
ENV PORT=8005
ENV NODE_ENV=production
ENV PASSPHRASE=LabMus2020#
ENV TZ=Europe/Vienna

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node:node package*.json ./

RUN npm ci

# Bundle app source
COPY --chown=node:node . .

USER node

CMD [ "node", "--experimental-specifier-resolution=node","src/index.js" ]