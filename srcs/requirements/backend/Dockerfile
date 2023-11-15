# LINK: https://hub.docker.com/_/node
# LINK: https://github.com/nodejs/docker-node/blob/ce9bfa282b62ece538fef25b954ade4401a7c8c7/20/alpine3.18/Dockerfile
# LINK: https://docs.nestjs.com/

FROM node:20.7.0-alpine3.18
# FROM node:20.7.0-alpine

RUN apk update && apk upgrade && apk add --update --no-cache \
	ca-certificates \
	&& rm -f /var/cache/apk/*

# ENV TZ=Europe/Istanbul
# RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# openssl \
# RUN openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
# 	-out /etc/ssl/certs/ft_transcendence-backend.crt \
# 	-keyout /etc/ssl/certs/ft_transcendence-backend.key \
# 	-subj "/C=TR/ST=Kocaeli/L=Istanbul/O=Ecole42/OU=pongBackend/CN=pongBackend"

# RUN cp /etc/ssl/certs/ft_transcendence.crt /usr/local/share/ca-certificates/
# RUN chmod 644 /usr/local/share/ca-certificates/ft_transcendence.crt
# RUN update-ca-certificates

WORKDIR /app/nest-js

EXPOSE 3000

# ENTRYPOINT ["/bin/sh", "-c", "cp /etc/ssl/certs/ft_transcendence.crt /usr/local/share/ca-certificates/"]
# ENTRYPOINT ["/bin/sh", "-c", "chmod 777 /usr/local/share/ca-certificates/ft_transcendence.crt"]
# ENTRYPOINT ["/bin/sh", "-c", "update-ca-certificates"]

# We are installing NestJS package for global.
RUN ["npm", "install", "--global", "@nestjs/cli"]

# Installing other packages.
# RUN ["npm", "install"]

# Starting all this NestJS 'backend' project code.
# RUN ["npm", "run", "start:dev"]

# `-c` mean; After all this are giving like argument.
ENTRYPOINT ["/bin/sh", "-c", "npm install && npm run start:dev"]