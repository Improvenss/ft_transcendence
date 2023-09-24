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

FROM node:20.7.0-alpine3.18

# RUN apk update && \
# 	apk add --no-cache \
# 	&& rm -rf /var/cache/apk/*

RUN apk update && apk upgrade

WORKDIR /app/react-app

# RUN chmod -R 777 .
# RUN sudo chown -R $(whoami) ~/.docker

# COPY ./react-app/ .
# COPY react-app/package*.json .

EXPOSE 80

# We are installing React package for global.
# RUN ["npx", "create-react-app", "react-app", "--template", "typescript"]
RUN ["npm", "install", "--global", "react-cli", "react"]

# RUN ["npm", "install", "--global", "react-scripts"]

# Installing other packages.
# RUN ["npm", "install"]

# Starting all this NestJS 'backend' project code.
# RUN ["npm", "run", "start:dev"]

# `-c` mean; After all this are giving like argument.
ENTRYPOINT ["/bin/sh", "-c", "npm install --non-interactive && npm run start"]