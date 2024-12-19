FROM node:18

ARG PORT=3000

# Application parameters and variables
ENV APP_DIR=/usr/src/app

ENV LANG="C.UTF-8"
ENV NODE_ENV=production
ENV PORT=${PORT}

RUN mkdir -p $APP_DIR

WORKDIR $APP_DIR

# Install app dependencies
COPY . .

RUN npm i -g @nestjs/cli &&\
  npm install &&\
  npm run build

CMD ["node", "dist/main.js"]