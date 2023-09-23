# LINK: https://hub.docker.com/_/node
# LINK: https://github.com/nodejs/docker-node/blob/ce9bfa282b62ece538fef25b954ade4401a7c8c7/20/alpine3.18/Dockerfile
# LINK: https://docs.nestjs.com/

FROM node:20.7.0-alpine3.18

# RUN apk update && \
# 	apk add --no-cache \
# 	&& rm -rf /var/cache/apk/*

RUN apk update && apk upgrade

WORKDIR /app/nest-js

EXPOSE 3000

# We are installing NestJS package for global.
RUN ["npm", "install", "--global", "@nestjs/cli"]

# Installing other packages.
# RUN ["npm", "install"]

# Starting all this NestJS 'backend' project code.
# RUN ["npm", "run", "start:dev"]

# `-c` mean; After all this are giving like argument.
ENTRYPOINT ["/bin/sh", "-c", "npm install && npm run start:dev"]