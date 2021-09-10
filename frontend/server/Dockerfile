# We take the prepared debian-image
FROM debian:buster-slim

# And set the following directory as our workspace
WORKDIR /usr/src/app

# Now we need to prepare our brand new machine a little
# Imagine you install a fresh OS - first thing you do? Updates!
# Of course we don't want to get interrupted by command prompts,
# so we accept all asked questions with yes (-y option).
RUN apt-get update -y
RUN apt-get upgrade -y

# Now it's time to install cURL, which we need then to install nodejs
RUN apt-get install curl -y

# You guessed it folks: install nodejs
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install nodejs -y

# Now copy all files and folders (recusively) from where the Dockerfile 
# is locate to our WORKDIR folder /usr/src/app
# To exclude unnecessary files we use the .dockerignore file
COPY . .

# now we need to prepare and provide the modules that are needed by our
# express-server
RUN npm install

# this is the port which get's opened
EXPOSE 8080

# this is the command which gets invoked when we do $> docker run ...
CMD [ "node", "server-frontend.js" ]


