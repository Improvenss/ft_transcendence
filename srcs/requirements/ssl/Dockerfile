FROM alpine

RUN apk update && apk upgrade && apk add --update --no-cache \
	openssl \
	&& rm -f /var/cache/apk/*

RUN openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
	-out /etc/ssl/certs/ft_transcendence.crt \
	-keyout /etc/ssl/certs/ft_transcendence.key \
	-subj "/C=TR/ST=Kocaeli/L=Istanbul/O=Ecole42/OU=pong/CN=pong"

RUN chmod -R 777 /etc/ssl/certs