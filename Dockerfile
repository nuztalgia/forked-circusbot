FROM node:16-buster

WORKDIR /usr/src/app
VOLUME /usr/src/app/data

COPY cirque-bot.js .
COPY config.json .

CMD ["node", "cirque-bot.js"]
