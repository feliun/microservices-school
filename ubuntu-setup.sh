#!/bin/bash

#installing docker-compose
sudo curl -o /usr/local/bin/docker-compose -L "https://github.com/docker/compose/releases/download/1.15.0/docker-compose-$(uname -s)-$(uname -m)"
sudo chmod +x /usr/local/bin/docker-compose
docker-compose -v
nvm install 7
nvm use
npm install –g yarn
pushd recipes-api
yarn install
popd
pushd recipes-crawler
yarn install
popd
pushd recipes-id-generator
yarn install
popd
pushd recipes-infra
popd