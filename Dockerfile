FROM node:18-alpine3.17 as build
WORKDIR /app
COPY . /app
RUN yarn install
RUN yarn build

FROM nginx
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /var/www/html/
EXPOSE 80
CMD nginx -g "daemon off;"
