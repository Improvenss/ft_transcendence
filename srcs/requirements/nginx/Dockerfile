FROM debian:buster

RUN apt-get update && apt-get install -y nginx openssl

RUN mkdir -p /etc/nginx/ssl

#COPY ./nginx.conf /etc/nginx/conf.d/

#COPY ./default /etc/nginx/sites-available/

EXPOSE 443

COPY ./502.html /usr/share/nginx/html

RUN mkdir -p /run/nginx

CMD [ "nginx", "-g", "daemon off;" ]

#	<!--ssl_session_timeout 1d;
#	ssl_session_cache shared:SSL:50m;
#	ssl_session_tickets off;
#	ssl_prefer_server_ciphers on;-->

#  <!--location /sw.js {
#      add_header Cache-Control "no-cache";
#      proxy_cache_bypass $http_pragma;
#      proxy_cache_revalidate on;
#      expires off;
#      access_log off;
#  }-->