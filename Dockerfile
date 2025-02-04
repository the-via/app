FROM node:23-alpine

RUN apk update

RUN apk upgrade

RUN apk add jq xdg-utils

WORKDIR /app

COPY . .

RUN sed -i -e 's/vite --force/vite --force --host/' package.json

RUN npm install

RUN npm run build:azure || true

EXPOSE 5173

CMD [ "npm", "run", "dev" ]
