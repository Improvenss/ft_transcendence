FROM debian:buster

RUN apt-get update && apt-get install -y nginx openssl

RUN mkdir -p /etc/nginx/ssl

#COPY ./nginx.conf /etc/nginx/conf.d/

COPY ./default /etc/nginx/sites-available/

EXPOSE 443

RUN mkdir -p /run/nginx

CMD [ "nginx", "-g", "daemon off;" ]