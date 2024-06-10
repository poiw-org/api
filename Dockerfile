FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run build

ENV HOST 0.0.0.0

CMD [ "yarn", "start:prod" ]