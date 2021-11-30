FROM node:17

# Create app directory
WORKDIR /usr/src/app

# set environment variables
ENV PORT=8000
ENV NODE_ENV=production

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci --only=production

# Bundle app source
COPY . .

CMD [ "node","--experimental-specifier-resolution=node","src/index.js" ]