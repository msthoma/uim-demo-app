# build environment
FROM nikolaik/python-nodejs as builder

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
COPY ./wacom ./wacom
# Copy web source
COPY . ./

RUN npm rebuild node-sass
RUN npm install

FROM builder as packer
RUN npm run build

ENV NODE_ENV=production

# Start the service
CMD [ "npm", "start" ]
