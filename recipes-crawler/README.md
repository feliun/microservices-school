# svc-example
An example service using

* [systemic](https://github.com/guidesmiths/systemic)
* [confabulous](https://github.com/guidesmiths/confabulous)
* [prepper](https://github.com/guidesmiths/prepper)
* [systemic-express](https://github.com/guidesmiths/systemic-express)

## Features
* Environmental configuration
* Secrets obtained from a runtime location
* Automatically applies schema changes on startup
* Orderly startup / shutdown (e.g. establishes database connections before setting up http listeners and vice versa)
* Graceful shutdown on errors, unhandled rejections, unhandled exceptions, SIGINT and SIGTERM
* Useful log decorators, including request scoped logging
* JSON logging to stdout in "proper" environments, human friendly logging locally
* The Dockerfile uses settings from .npmrc and .nvmrc
* The docker build cache busts using package.json and npm-shrinkwrap.json so npm install only runs when necessary
* Deployed artifact (a docker image) is traceable back to SCM commit via manifest.json, exposed via /__/manifest endpoint

## Running locally
```
npm run docker
npm start
```

## Running tests
```
npm test
```

