# LINK: https://hub.docker.com/_/node
# LINK: https://github.com/nodejs/docker-node/blob/ce9bfa282b62ece538fef25b954ade4401a7c8c7/20/alpine3.18/Dockerfile
# LINK: https://www.npmjs.com/package/react-cli
# LINK: https://create-react-app.dev/docs/adding-typescript/
# What is 'npx'?
# LINK: https://www.codingninjas.com/studio/library/difference-between-npm-and-npx
# LINK: https://www.freecodecamp.org/news/npm-vs-npx-whats-the-difference/
# How can i install first start?
# LINK: https://react.dev/learn/start-a-new-react-project
# How can i add existing project?
# LINK: https://react.dev/learn/add-react-to-an-existing-project

# How can i see all 'trusted certificates' from alpine?
# $> openssl crl2pkcs7 -nocrl -certfile /etc/ssl/certs/ca-certificates.crt | openssl pkcs7 -print_certs -noout
# How can you check your certificate is trusted?
# $> openssl crl2pkcs7 -nocrl -certfile /etc/ssl/certs/ca-certificates.crt | openssl pkcs7 -print_certs -noout | grep pong

# How can i see all 'trusted certificates' from macos?
# $> openssl crl2pkcs7 -nocrl -certfile /etc/ssl/cert.pem | openssl pkcs7 -print_certs -noout


# Add the certificate to the macos trust store?
# security verify-cert -c ./certificate.crt > /dev/null 2>&1
# if [ $? != 0 ]; then
#     echo "Adding certificate to trust store ..."
#     security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ./certificate.crt
# fi

FROM node:20.7.0-alpine3.18

RUN apk update && apk upgrade && apk add --update --no-cache \
	ca-certificates \
	openssl \
	&& rm -f /var/cache/apk/*

RUN openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
	-out /etc/ssl/certs/ft_transcendence.crt \
	-keyout /etc/ssl/certs/ft_transcendence.key \
	-subj "/C=TR/ST=Kocaeli/L=Istanbul/O=Ecole42/OU=pong/CN=pong"

RUN cp /etc/ssl/certs/ft_transcendence.crt /usr/local/share/ca-certificates/
RUN chmod 644 /usr/local/share/ca-certificates/ft_transcendence.crt
RUN update-ca-certificates

WORKDIR /app/react-app

EXPOSE 80

ENTRYPOINT ["/bin/sh", "-c", "npm install --non-interactive\
&& npm start"]




# We are installing React package for global.
# RUN ["npx", "create-react-app", "react-app", "--template", "typescript"]
# npm i react@latest react-dom@latest

# RUN ["npm", "install", "--global", "react@latest", "react-router-dom", "react-dom@latest"]

# RUN ["npm", "install", "react@latest"]
# RUN ["npm", "install", "react-dom@latest"]

# RUN ["npm", "install", "--save-dev", "@types/react-router-dom"]
# Bu da 'react-devtools'un web browser'deki eklentisini kullanabilmek icin.
# RUN ["npm", "install", "--global", "react-devtools"]

# Bu cok sacma bir sekilde eklenmiyor saka gibi...
# RUN ["npm", "install", "react-meta-tags"]
# RUN ["npm", "install", "--save-dev", "@types/react-meta-tags"]

# Installing other packages.
# RUN ["npm", "install"]

# Starting all this NestJS 'backend' project code.
# RUN ["npm", "run", "start:dev"]

# `-c` mean; After all this are giving like argument.



# root@gsever-debian:/home/gsever/Desktop/ft_transcendence# npm install --global @nestjs/cli^C
# root@gsever-debian:/home/gsever/Desktop/ft_transcendence# nest new hello-friend^C
# root@gsever-debian:/home/gsever/Desktop/ft_transcendence# npm install npx^C
# root@gsever-debian:/home/gsever/Desktop/ft_transcendence# npm install --global react-li react^C
# root@gsever-debian:/home/gsever/Desktop/ft_transcendence# npx create-react-app asdf-app --template typescript