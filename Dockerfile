FROM node:10.19.0-alpine3.11
RUN mkdir /app
WORKDIR /app

# NPM install
COPY package.json package-lock.json ./
RUN npm ci

# Build
COPY . .
RUN npm run-script build

ENV PERSIST=/db
ENTRYPOINT ["/app/bin/codenames-redux-slack-bot"]
