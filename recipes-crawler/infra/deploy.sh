#!/bin/bash

docker run -d -p 3001:3001 -e SERVICE_ENV=live -e F2F_KEY=$F2F_KEY -e RABBIT_PWD=$RABBIT_PWD --name recipes-crawler quay.io/feliun/recipes-crawler:latest
