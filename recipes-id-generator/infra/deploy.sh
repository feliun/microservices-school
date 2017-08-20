#!/bin/bash

docker run -d -p 3002:3002 -e SERVICE_ENV=live -e MONGO_URL=$MONGO_URL -e SUMO_URL=$SUMO_URL --name recipes-id-generator quay.io/feliun/recipes-id-generator:latest
