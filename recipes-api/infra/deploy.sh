#!/bin/bash

docker run -d -p 3000:3000 -e SERVICE_ENV=live -e MONGO_URL=$MONGO_URL -e RABBIT_PWD=$RABBIT_PWD --name recipes-api quay.io/feliun/recipes-api:latest
