#!/bin/bash

if [ $# -eq 0 ]
then
    echo "Please define an environment (development|test|prod) as first argument."
    exit 1
fi

if [ $# -eq 1 ]
then
    echo "Please define mode for environemnt as second argument."
    exit 1
fi

if [ $# -eq 2 ] && [ $1 != "development" ]
then
    echo "Two arguments are only allowed for environment development."
    exit 1
fi

if [ $# -eq 3 ] && [ $1 != "test" ] && [ $1 != "prod" ]
then
    echo "Three arguments are only allowed for environments test or prod."
    exit 1
fi

ENV=$1
MODE=$2
SERVER=$3

echo "Deploy for $ENV"

stop_server () {

    if [[ $(docker compose ls -q) == "2a5" ]]
    then
        echo "I'll shut down the runnning docker compose project..."
        docker compose --env-file ./.env.development.docker.local down
    else
        echo "There is no docker compose project running. I'll do nothing and exit."
    fi
}

start_server () {

    if [[ $(docker compose ls -q) == "2a5" ]]
    then
        echo "There is a docker compose project runnning still. I'll do nothing and exit."
    else
        echo "I'll start the docker compose project now..."
        docker compose --env-file ./.env.development.docker.local build --no-cache
        docker compose --env-file ./.env.development.docker.local up -d
    fi
}

restart_server () {

    stop_server
    start_server

}

if [ $ENV == "development" ]
then

    if [ $MODE == "start" ]
    then

        start_server
        exit 0

    elif [ $MODE == "stop" ]
    then

        stop_server
        exit 0

    elif [ $MODE == "restart" ]
    then

        restart_server
        exit 0

    elif [ $MODE == "clean" ]
    then

        docker volume rm 2a5_db-data
        exit 0

    else

        echo "Please define mode for development (start|stop|restart|clean)"

    fi

elif ( [ $ENV == "test" ] || [ $ENV == "prod" ] )
then

    if [ $MODE == "build" ]
    then

        rm -rf build/
        mkdir -p build/

        # check if docker container still running
        if [[ $(docker compose ls -q) == "2a5-build" ]]
        then
            docker stop 2a5-build
        fi

        # targets the builder stage and stops there - does not run node server inside
        docker build --no-cache -f Dockerfile --target builder -t 2a5-build .

        # -i argument to keep open
        docker run --rm -d -i --name 2a5-build 2a5-build

        # copy build increments from docker container
        docker cp 2a5-build:/app/.next/standalone/. ./build

        # from the documentation: https://nextjs.org/docs/advanced-features/output-file-tracing
        # Additionally, a minimal server.js file is also output which can be used instead of next start.
        # This minimal server does not copy the public or .next/static folders by default as these should
        # ideally be handled by a CDN instead, although these folders can be copied to the standalone/public
        # and standalone/.next/static folders manually, after which server.js file will serve these automatically.
        docker cp 2a5-build:/app/.next/static/. ./build/.next/static

        # copy new schema
        docker cp 2a5-build:/app/prisma/. ./build/prisma
        # cp -r prisma build/prisma

        # need to stop it due to -i on run
        docker stop 2a5-build

        # not being copied on build
        cp -r public build/public

        # copy config
        cp .env.$ENV.docker.local build/.env

        # bundle the files we need
        tar -cvf build.tar build

        # append the bundle
        tar -rvf build.tar docker-compose.yml Dockerfile

        # cleanup locally
        rm -rf build/

        # secure copy to our remote location
        scp build.tar $SERVER:.

        # remove local bundle
        rm build.tar

        # check if containers are running
        #ssh $SERVER "docker compose --env-file ./build/.env down"

        # stop the running containers
        ssh $SERVER "docker compose --env-file ./build/.env down"
        ssh $SERVER "rm -rf build"
        ssh $SERVER "tar -xvf build.tar"
        ssh $SERVER "rm build.tar"
        ssh $SERVER "docker compose --env-file ./build/.env build --no-cache"
        ssh $SERVER "docker compose --env-file ./build/.env up -d"
        ssh $SERVER "docker ps"

        # deploy the prisma db schema changes
        ssh $SERVER "docker exec 2a5-web-$ENV npx prisma migrate deploy"

        exit 0

    elif [ $MODE == "clean" ]
    then

        ssh $SERVER "docker compose --env-file ./build/.env down"
        ssh $SERVER "rm -rf build"
        ssh $SERVER "rm Dockerfile docker-compose.yml"

    fi

else

    echo "Please define an environment (development|test|prod)"

    exit 1

fi
