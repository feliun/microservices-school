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

# DevOps

# Architecture principles
