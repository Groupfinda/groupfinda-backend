#Base Image
FROM node:alpine AS base

WORKDIR /usr/app/backend
COPY ./package*.json ./
RUN npm install

COPY ./ ./
RUN npm run build

FROM node:alpine
WORKDIR /usr/app/backend

COPY ./package*.json ./
RUN npm install --only=production

COPY --from=base /usr/app/backend/dist ./dist

USER node
CMD ["node" , "dist/server.js"]