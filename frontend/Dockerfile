FROM node:latest as build-stage
WORKDIR /app

ENV VUE_APP_BACKEND=https://greschner.azurewebsites.net/backend
ENV NODE_ENV production
ENV TZ=Europe/Vienna

COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
