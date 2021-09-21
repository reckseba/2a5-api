#!/bin/bash

if [ $# -eq 0 ]
then
    echo "Please define an environment (local|test|prod)."
    exit 0
fi

ENV=$1
SERVER=$2

COUNTRY="DE"
COMMONNAME="test.2a5.de"

echo "Deploy for $ENV"

if [ -e ssl/test.cert.pem ]
then
    echo "No need to create new ssl cert."
else
    echo "Create new ssl cert.."
    mkdir -p ssl
    cd ssl
    openssl genrsa -out test.privkey.pem
    openssl req -new -key test.privkey.pem -out test.csr.pem -subj "/C=$COUNTRY/CN=$COMMONNAME"
    openssl x509 -req -days 9999 -in test.csr.pem -signkey test.privkey.pem -out test.cert.pem
    rm test.csr.pem
    cd ..
fi


if [ $ENV == "local" ]
then
    # docker procedure here
    
    # TODO prepare docker network!!!

    # take care of backend

    # stop old container
    docker stop 2a5-backend

    # stop old container
    docker stop 2a5-frontend

    # create config dir if not yet exists
    mkdir -p backend/config

    # copy local config file
    cp config/process.local.env backend/config/process.env

    cp -r ssl backend/ssl

    # switch folder
    cd backend

    # run build command
    docker build . -t 2a5-backend

    # run the backend container
    docker run --rm -p 5000:5000 -d --name 2a5-backend --network="2a5-network" --ip="172.28.0.5" 2a5-backend

    # prompt if running
    docker ps

    rm -rf config
    rm -rf ssl

    cd ..

    # take care of frontend


    # create config dir if not yet exists
    mkdir -p frontend/server/config

    # copy local config file
    cp config/process.local.env frontend/server/config/process.env

    cp -r ssl frontend/server/ssl

    # copy react-app
    cd frontend
    cp -r app/build server/build

    # switch folder
    cd server

    # run build command
    docker build . -t 2a5-frontend

    # run the frontend container
    docker run --rm -p 8080:8080 -d --name 2a5-frontend --network="2a5-network" --ip="172.28.0.8" 2a5-frontend

    # prompt if running
    docker ps

    rm -rf config
    rm -rf build
    rm -rf ssl
    cd ../..

else
    # connect to server and upload

    # create config dir if not yet exists
    mkdir -p backend/config
    mkdir -p frontend/server/config

    # copy config
    cp config/process.$ENV.env backend/config/process.env
    cp config/process.$ENV.env frontend/server/config/process.env

    cp -r frontend/app/build frontend/server/build    

    # bundle the files we need
    tar -cvf deploy.tar backend/config/process.env backend/models/url.js backend/routes/api.js backend/package.json backend/server-backend.js

    # append the bundle with frontend files
    tar -rvf deploy.tar frontend/server/build frontend/server/config/process.env frontend/server/package.json frontend/server/server-frontend.js

    # if this is a test: copy locally created ssl cert
    if [ $ENV == "test" ]
    then
        cp -r ssl backend/ssl
        cp -r ssl frontend/server/ssl

        tar -rvf deploy.tar backend/ssl/test.cert.pem
        tar -rvf deploy.tar backend/ssl/test.privkey.pem
        tar -rvf deploy.tar frontend/server/ssl/test.cert.pem
        tar -rvf deploy.tar frontend/server/ssl/test.privkey.pem

        rm -rf backend/ssl
        rm -rf frontend/server/ssl
    fi

    # cleanup locally
    rm -rf frontend/server/build
    rm -rf frontend/server/config
    rm -rf backend/config

    # secure copy to our remote location
    scp deploy.tar $SERVER:.

    # remove local bundle
    rm deploy.tar

    # stop all running servers
    # remove exisiting frontend folder
    # remove exisitng backend folder
    # unpack tar file and remove that bundle
    ssh $SERVER "forever stopall; rm -rf frontend/; rm -rf backend/; tar -xvf deploy.tar; rm deploy.tar;"
    
    # if this is prod then copy exisitng ssl files to front- and backend folder locations
    # TODO: check if all necessary files are present
    if [ $ENV == "prod" ]
    then
        ssh $SERVER "cp -r ssl/ backend/ssl; cp -r ssl/ frontend/server/ssl;"
        # TODO: chmod 400 to all files
    fi

    # install npm dependencies for front- and back-end express-servers
    ssh $SERVER "cd backend; npm install; forever start server-backend.js; cd ../frontend/server; npm install; forever start server-frontend.js; forever list;"

fi


