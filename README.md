# 2a5
Open Source URL-Shortener with combined front- &amp; back-end parts based on React, Next.js, Typescript, TailwindCSS, Prisma, PostgreSQL &amp; Docker for local testing.

## The Idea
Long URLs do not get interpreted as links very often. To keep short messages that contain links short, a url-shortener is needed.

## Reception
You should not trust any web-service out there. Therefore you should not trust 2a5.de either. There is no way I, as the administrator of 2a5.de, can assure you, as a client, that the software, that my server is running, is what is published here. Whatever leaves your browser must be considered public. If you want nobody else to know, what links you are shortening: host your own instance. This tutorial teaches you how.

## Project Design
The goal was to make use of Server-Side-Rendering (SSR) inside a React-App, which was achieved by using Next.js. Database shall be handled by PostgreSQL, seamlessly integrated by Prisma. To discover errors early, Typescript was used for type definitions. Style was handled by TailwindCSS.

# Development
You need to install on your local workstation:
- git
- nodejs
- npm
- docker

Clone the repository:
```bash
git clone https://github.com/reckseba/2a5-api.git
```

Install your environment
```bash
cd 2a5-api
npm install
```

Prepare your local config:
```bash
cp ./.env.development.sample ./.env.development.local
```
Do changes in ./.env.development.local now.

Run the database server:
```bash
docker compose --env-file ./.env.development.local up -d db
```

Generate the typescript types out of the schema.
```bash
npm run prismagenerate
```

Push the database schema to postgres (only on first start when docker volume is initially created)
```bash
npm run prismamigratedev
```

Run the nodejs development server:
```bash
npm run dev
```

Happy coding. API is available at [http://localhost:3000/api](http://localhost:3000/api).

If you do changes to the database schema run (while db is up)
```bash
npm run prismamigratedev
```

Stop it with CTRL+C

To stop the database server:
```bash
docker compose --env-file ./.env.development.local down
```

# Testing
Run Cypress tests (make sure db docker and local node server is running)

__Warning__: This command truncates your table content!
```bash
npm run test
```

Check your API via curl:
```bash
source .env.development.local && curl localhost:3000/api/token/correct -H "Accept: application/json" -H "Authorization: Bearer ${ADMIN_TOKEN}"
```
Expected response: `{"message":"success"}`

# Linting
Run to check for linting errors:
```bash
npm run lint
```

# Deploy Development (locally)
This runs the environment on docker. It supports hot reload.

Prepare your local config (if not done already):
```bash
cp ./.env.development.sample ./.env.development.local
```
Do changes in ./.env.development.local now.


Start the api and db containers (In -d detached mode, watch does not work)
```bash
docker compose --env-file ./.env.development.local up --build --watch
```

Push the database schema to postgres (only if not done before on first start when docker volume is initially created).
```bash
npm install
npm run prismamigratedeploy
```

If you like you can run (Run `npm i` before if never done before)
__Warning__: This command truncates your table content!
```bash
npm run test
```

Stop the api and db containers
```bash
docker compose --env-file ./.env.development.local down
```

# Cleanup locally

Delete all generated files
```bash
rm -rf .next/ node_modules/ next-env.d.ts cypress/screenshots/ cypress/videos/
```
If you want to delete your docker postgres image (volume with database entries remains)
```bash
docker image rm postgres:14-alpine
```

Remove the volume
```bash
docker volume rm 2a5-db-data-development
```

DANGER! Erases all containers
```bash
docker container prune
```

DANGER! Erases all images
```bash
docker image prune -a
```

# Deployment to test/staging/production systems

Checkout 2a5-deploy repository.