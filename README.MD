# Welcome to the Groupfinda Backend

This is the repository for the Groupfinda backend. In here you should find documentation on what the backend is built with, how to build it for development and how to deploy the backend.

## Built with:

- Express.js
- Typescript
- Apollo-Server for GraphQL
- Mongoose for MongoDB
- Nodemon

## Setting up the development enviroment with Docker

1. Git Clone the repository
2. Ensure that Docker is installed on your computer

## Running the backend for development

Once you are ready to run the backend, follow the following steps:

1. Run `docker-compose up --build`
2. View the graphql playground at your Docker host (192.168.99.100 for Toolbox users)
3. Press CTRL + C to stop Docker
4. Clean up with `docker-compose down -v` and `docker volume prune`

## Testing the backend

We use integrated test with a MongoDB container.

1. Make sure that images are built with `docker-compose -f docker-compose-test.yml build`
2. To run a one-time test, `docker-compose -f docker-compose-test.yml run --rm test npm run test`
3. To run tests in watch mode, `docker-compose -f docker-compose-test.yml run --rm test npm run test:dev`
4. As always, remember to clean up existing containers with `docker-compose -f docker-compose-test.yml down`

## Setting up the development enviroment without Docker

1. Git Clone the repository
2. do a `npm install` within the directory.

## Running the backend for development

Once you are ready to run the backend, follow the following steps:

1. Run `npm run dev`
2. View the graphql playground at [http://localhost:3002/graphql](http://localhost:3002/graphql)

## Deploying the backend.

Once you are ready to build a backend build follow the following steps:

1. Run `npm run build`
2. Run `npm run start`
3. View the backend at [http://localhost:3002/graphql](http://localhost:3002/graphql)
