FROM node:21-alpine

RUN apk update

RUN apk upgrade

RUN apk add jq xdg-utils

WORKDIR /app

COPY . .

RUN sed -i -e 's/run dev/run dev -- --host/' package.json

RUN npm install

RUN npm run build:azure || true

EXPOSE 5173

CMD [ "npm", "start" ]
