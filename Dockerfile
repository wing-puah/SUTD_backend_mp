FROM node:latest

WORKDIR /app

COPY . .

RUN npm install
RUN npm install -g concurrently


CMD ["concurrently", "npm:db:migrate"]