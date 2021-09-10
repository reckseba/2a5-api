FROM debian:buster-slim

WORKDIR /usr/src/app

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install curl -y
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install nodejs -y

COPY . .

RUN npm install

EXPOSE 8080

CMD [ "node", "server-frontend.js" ]


