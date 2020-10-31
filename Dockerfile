FROM node

WORKDIR /app
ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json

RUN npm install

ADD . /app
RUN ./node_modules/.bin/tsc
RUN mv public/ dist/

CMD node dist/index.js
