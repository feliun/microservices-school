lint:
	@node_modules/.bin/eslint .

qa:
	@make lint && npm run test

package:
	@docker build --tag $(SERVICE):$(TRAVIS_BUILD_NUMBER) .
	@docker images

brand:
	@node_modules/make-manifest/bin/make-manifest --extra "build.url: https://travis-ci.org/feliun/microservices-school/builds/"$(TRAVIS_BUILD_ID) --extra "build.number: "$(TRAVIS_BUILD_NUMBER)
	@cat ./manifest.json

test:
	@docker run --name $(SERVICE) --env SERVICE_ENV=build --rm --network=local --entrypoint npm $(SERVICE):$(TRAVIS_BUILD_NUMBER) test --

archive:
	@docker login -u=$(DOCKER_USERNAME) -p=$(DOCKER_PASSWORD) quay.io

ensure-dependencies:
	@npm run docker