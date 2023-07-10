FROM node:18-alpine3.17 as build
WORKDIR .
RUN yarn install
RUN yarn build

FROM ubuntu
COPY --from=build ./dist /var/www/html/
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
