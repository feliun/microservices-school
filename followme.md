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

# DevOps
## Continuos integration

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

# Architecture principles
