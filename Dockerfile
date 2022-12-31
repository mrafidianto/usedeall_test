FROM node:16.19-alpine
EXPOSE 3000
WORKDIR /usr/app
COPY package.json /.
RUN npm install --omit=dev && npm cache verify && npm cache clean --force
COPY . .
CMD ["node", "index.js", "|", "./node_modules/.bin/pino-pretty","--translateTime","--colorize"]