#!/bin/bash
sudo apt update

#installing sublime
wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg | sudo apt-key add -
sudo apt-add-repository "deb https://download.sublimetext.com/ apt/stable/"
sudo apt install sublime-text

#installing nodejs
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source ~/.profile
nvm install 10.5.0
node -v

#installing docker-compose
sudo curl -o /usr/local/bin/docker-compose -L "https://github.com/docker/compose/releases/download/1.15.0/docker-compose-$(uname -s)-$(uname -m)"
sudo chmod +x /usr/local/bin/docker-compose
docker-compose -v
nvm install 7
nvm use 7
npm install -g yarn
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
yarn install
popd