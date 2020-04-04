FROM node:10.19.0-alpine3.11
RUN mkdir /app
WORKDIR /app
COPY . .
RUN npm install
