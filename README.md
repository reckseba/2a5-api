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
git clone https://github.com/reckseba/2a5.git
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
npm run prismadbpush
```

Run the nodejs development server:
```bash
npm run dev
```

Start coding and open [http://localhost:3000](http://localhost:3000) with your browser of choice to check the result. The system supports hot reload.

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

# Linting
Run to check for linting errors:
```bash
npm run lint
```

# Deploy Development (locally)
This runs the environment on docker. It does not support hot reload.

Prepare your local config:
```bash
cp ./.env.development.docker.sample ./.env.development.docker.local
```

Put same db password like in `.env.development.local`
```bash
vim ./.env.development.docker.local
```

Start the web and db containers
```bash
./deploy.sh development start
```

Push the database schema to postgres (only if not done before on first start when docker volume is initially created)
```bash
npm run prismamigratedeploy
```

If you like you can run (Run `npm i` before if never done before)
__Warning__: This command truncates your table content!
```bash
npm run test
```

Stop the web and db containers
```bash
./deploy.sh development stop
```

Restart the web and db containers
```bash
./deploy.sh development restart
```

# Create SSH Config

Your ~/.ssh/config file should include a section such as:
```bash
Host servername
    HostName 1.2.3.4
    User yourusername
    IdentityFile ~/.ssh/privatekeyfile
```

# Security Considerations 

You could launch this API twice
- One public facing for the Client-APP with high restrictions on the database
- The other in private not being exposed to the public with a little more rights to facilitate the admin operations.

# Deploy Test
This builds, takes the increment, uploads it and runs it in docker on the server.

Prepare your local config
```bash
cp ./.env.test.docker.sample ./.env.test.docker.local
vim ./.env.test.local
```

This will build the Dockerfile until the builder stage. Then it runs a docker container named `2a5-build` from which the deployment script will copy the build increments. Finally it copies the build to your remote location, unpacks and runs it via docker compose. At last it migrates the latest database schema to the postgres instance.
```bash
./deploy.sh test build servername
```

The following command stops the remote containers and deletes the directory `build`.
```bash
./deploy.sh test clean servername
```
If you want to remove images and volumes, have a look at the Cleanup remote section.


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

# Cleanup remote test

Remove the volume
```bash
docker volume rm 2a5-db-data-test
```

Remove used images
```bash
docker image rm 2a5-web-test:latest
docker image rm postgres:14-alpine
```
