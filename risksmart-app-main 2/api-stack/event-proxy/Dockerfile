# syntax=docker/dockerfile:1.20

FROM node:22 AS development

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /code

ARG PORT=80
ENV PORT $PORT

COPY package.json /code/package.json

RUN npm i

HEALTHCHECK --interval=5s \
  CMD node healthcheck.mjs

COPY . /code

USER node

CMD [ "node", "src/index.mjs" ]
