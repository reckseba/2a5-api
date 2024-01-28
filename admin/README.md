# 2a5 Admin

## Development
Make sure you followed the development steps for the client and already have created the `.env.development.local` file and generated the prisma client (There should be a non empty `prisma-client` directory at the root of this project).

Install your environment
```
cd 2a5/admin
npm install
```

Run the database server from the root:
```bash
docker compose --env-file ./.env.development.local up -d db
```

Run the nodejs development server #1:
```bash
npm run build
npm run start
```

Run the nodejs development server #2:
```bash
npm run dev
```

Start coding and open [http://localhost:8001](http://localhost:8001) with your browser of choice to check the result. The system supports hot reload.

Stop it with CTRL+C

To stop the database server:
```bash
docker compose --env-file ./.env.development.local down
```
