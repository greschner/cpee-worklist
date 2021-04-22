FROM node:15

# Create app directory
WORKDIR /usr/src/app

ENV PORT=8001
ENV NODE_ENV=production

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci --only=production

# Bundle app source
COPY . .

CMD [ "node", "src/index.js" ]