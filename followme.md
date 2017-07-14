# Preflight

1. Install nvm: https://github.com/creationix/nvm#install-script
2. Install node/npm: https://nodejs.org/en/
3. Install docker: https://docs.docker.com/engine/installation/
4. Create a slack account
5. Setup your github account
6. Fork https://github.com/feliun/microservices-school

# Introduction

## Node JS Introduction

### A systemic-based service

```
cd basic-microservice
npm i
npm run start
curl http://localhost:3000/__/manifest
```

### in-memory RESTful API for recipes

```
cd recipes-api
npm i
npm t
```
- [Basic setup](https://github.com/feliun/microservices-school/commit/7f8ea46f69017f2b3748313fdabbe98d1d91b792)
- [Choosing store: strategy pattern](https://github.com/feliun/microservices-school/commit/910cb1283606d6d95ba71dd822501001d8942a71)
- [In-memory store](https://github.com/feliun/microservices-school/commit/8b07859deb97d5d98a3ae230b6af74923772e50f)
- [Recipes API + tests](https://github.com/feliun/microservices-school/commit/12ecc27016a67a05e51a43c6853786857a04d0db)
- [Optimistic control based on versions](https://github.com/feliun/microservices-school/commit/8949ea7119156e4eb6e279aa75f770545daa144f)

# Interaction & comunication

## Mongo Introduction

### Mongo RESTful API for recipes
- [Docker config](https://github.com/feliun/microservices-school/commit/829bbc3ced32e701136f94f55c9f0344abfcd377)
- [Adding mongo systemic component](https://github.com/feliun/microservices-school/commit/2deb5b311ee785781d20c098f55a52d32ec5e5a4)
- [Mongo store + tests](https://github.com/feliun/microservices-school/commit/5423f7f0f9c0acd358e8181bcc988e5434e26a1d)
- [Refactor: proxy store](https://github.com/feliun/microservices-school/commit/77b26f343442a9c45f1c029a462db54a776bfc15)
- [Refactor: multiple automatic tests](https://github.com/feliun/microservices-school/commit/ef2eb0d9e000dc63fbab2dce4c761ef089c4d28f)

## RabbitMQ Introduction

### Publishing conclusions
- [Docker config](https://github.com/feliun/microservices-school/commit/efbec01dde74d9ae07a190c801166367660d9da1)
- [Wiring up rabbitmq](https://github.com/feliun/microservices-school/commit/de850c4a9e45aef527e3b0fdb5a7c0d726a9f250)
- [Publishing conclusions on every store action](https://github.com/feliun/microservices-school/commit/a466f9d5d08f510a18919ae3bd94f0965ffe1c59)
- [Subscribing to conclusions to test published messages](https://github.com/feliun/microservices-school/commit/9035623f0742660f56430bfa5437a74e5cc61599)

## Building a recipes crawler

### Recipe crawler
```
mkdir recipes-crawler
cp -r basic-microservice/* recipes-crawler/ && cp -r basic-microservice/.* recipes-crawler/
rm -rf node_modules/
nvm use && npm i
npm t
```
- [Initial commit](https://github.com/feliun/microservices-school/commit/4aa6fb767a751480eeccb667d2bccd73f4e70228)
- [Docker config](https://github.com/feliun/microservices-school/commit/2851c9323f9fd4d794f37091735777c1d4dfca1b)
- [Wiring up rabbitmq](https://github.com/feliun/microservices-school/commit/cf5b166f2f69c20bfa60bb4f30d4bdb0bc68f326)
- [Basic crawler set up](https://github.com/feliun/microservices-school/commit/072825d0bee2e3e46a21963d109a3bcd49b65130)
- [Using config](https://github.com/feliun/microservices-school/commit/cd5b8f8342c24e6adf85572415511cb5fb377dff)
- [Crawling recipes from the source](https://github.com/feliun/microservices-school/commit/1e2005bc386435a3ced034b59d3572278c9b01a3)
- [Preparation for tests](https://github.com/feliun/microservices-school/commit/d2cde89e0405713e18f2a77e50603ac8083e4347)
- [Testing crawling](https://github.com/feliun/microservices-school/commit/52a55c751d130242c2db977a5f60eefe93a33705)

### Wiring up both services
- [Subsystem to initialise subscriptions](https://github.com/feliun/microservices-school/commit/1e87161d2d073e9cd42505a59bb8618a1f72c261)
- [Rabbit config to subscribe to crawler](https://github.com/feliun/microservices-school/commit/3711a1d05f96a31f8b373e4165be976b66fa6746)
- [Subscribing to crawled recipes](https://github.com/feliun/microservices-school/commit/a5468ce5750a8c6b9c1351211467f12ff2c4d787)

### Testing locally
- Create your own spy queue and check mongo content
- [First architecture problem: we need our own ids](https://github.com/feliun/microservices-school/commit/3ec8c312f7468689b537ef4d77aae214979a9773)
- [Errors handling - recoverable, irrecoverable, absolved](https://github.com/feliun/microservices-school/commit/caaf2b38121591366fbe799a9c40eb358705883e)

# DevOps

## Continuos integration (commit, build, test, brand, package, archive)
- Setting up travis for our project
- [Basic CI pipeline using Makefile: COMMIT, BUILD, TEST](https://github.com/feliun/microservices-school/commit/09ee8ba01300d70ef557694aa3d432c7a81708a6), outcome could be check [here](https://travis-ci.org/feliun/microservices-school/builds/252189365)
- [Adding linting to qa process](https://github.com/feliun/microservices-school/commit/590035a42f7eab7ebca6dff67ac61e8d815da4b6) and [a small fix](https://github.com/feliun/microservices-school/commit/5427a38c41e6740cad25709d22331600ff91f864)
- [Brand step](https://github.com/feliun/microservices-school/commit/3d2e01d008d1e831220e756d441f721bb8ea7bf4)
- [Package step using Dockerfiles](https://github.com/feliun/microservices-school/commit/db5d8b1bef578817c6002f93afc07255e72f5968). Build output could be seen [here](https://travis-ci.org/feliun/microservices-school/builds/252595747)
- Saving building time. Building a basic image from a [different repository](https://github.com/feliun/docker-nvm-yarn/commit/1dccb1a679d9a3aa71efe30cde3e24f1a6fcbb8e). Some instructions [here](https://github.com/feliun/docker-nvm-yarn#docker-nvm-yarn). The build output could be seen [here](https://quay.io/repository/feliun/docker-nvm-yarn/build/a5c5ecdd-fea8-436e-9898-dfb2ac60eeba). The image could be retrieved by doing `docker pull quay.io/feliun/docker-nvm-yarn`.
- [Simpler build as docker is in charge of installation, nvm management etc](https://github.com/feliun/microservices-school/commit/b7d8440b5525037b39a651aaf74714a5a04bc3e9)
- [Still not ready for previous step. We need to replace tests as well first](https://github.com/feliun/microservices-school/commit/4eed25035e34c4589ac7f52dfcac64bb0f0734a9)
- Making it faster: running tests inside container [here](https://github.com/feliun/microservices-school/commit/29e0ee35fea4dd458d3a94d8a6748495685fcd7a) and [here](https://github.com/feliun/microservices-school/commit/e122515d7321c3f50f3851673d29db2e106a48a8). This could be seen [in this build](https://travis-ci.org/feliun/microservices-school/builds/253291881).
- Fix for the brand step [here](https://github.com/feliun/microservices-school/commit/26f112be3b55e0c446dfc9c49b563a05be5f28f5) and [here](https://github.com/feliun/microservices-school/commit/444e35a168c819f5a6c447c676429ab9f38d4607).
- Last step: [archiving the artefact](https://github.com/feliun/microservices-school/commit/6faae4e62912794ebd4a8d28059b6c869cb5efb6) and [enabling it in the build](https://github.com/feliun/microservices-school/commit/1f7ffb977a8d6b000b330aad67dc3d7c4039b1c6) and a [fix](https://github.com/feliun/microservices-school/commit/fadb27a833274ea5a4149d611ef64578c4b51503).Build could be checked [here](https://travis-ci.org/feliun/microservices-school/builds/253555540).
- Checking containers [here](https://github.com/feliun/microservices-school/commit/dd1a2f57d9871aa21413c00dfcc56e06b6b2b65d) and [missing command here](https://github.com/feliun/microservices-school/commit/31c0cc8793a5b3063656beb8a07d9b5775cf4bcc).
- [Fixing port allocation](https://github.com/feliun/microservices-school/commit/2cc5a893414a2061e5c92665ea67b93c80ef599c)
- [Using build.json to test in CI, live.json to start the container](https://github.com/feliun/microservices-school/commit/bb9cf881cd9b8333303de115626773d28a79766f).

# Architecture principles
