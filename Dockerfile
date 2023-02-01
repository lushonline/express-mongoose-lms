FROM node:lts-alpine
ENV NODE_ENV production
RUN mkdir /app
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY ./src ./src
EXPOSE 3000
CMD npm start