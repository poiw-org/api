FROM node:lts-bullseye

WORKDIR /usr/src/app

COPY . .

RUN yarn install
RUN yarn build

ENV HOST 0.0.0.0

CMD [ "yarn", "start:prod" ]