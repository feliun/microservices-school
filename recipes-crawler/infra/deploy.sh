#!/bin/bash

docker run -d -p 3001:3001 -e SERVICE_ENV=live -e F2F_KEY=$F2F_KEY -e RABBIT_PWD=$RABBIT_PWD -e SUMO_URL=$SUMO_URL --name recipes-crawler --network=local quay.io/feliun/recipes-crawler:latest
