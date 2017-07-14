DOCKER_HOST=quay.io
DOCKER_ACCOUNT=feliun

package:
	@docker build --tag $(SERVICE):$(TRAVIS_BUILD_NUMBER) .
	@docker images

brand:
	@npm i make-manifest && node_modules/make-manifest/bin/make-manifest --extra "build.url: https://travis-ci.org/feliun/microservices-school/builds/"$(TRAVIS_BUILD_ID) --extra "build.number: "$(TRAVIS_BUILD_NUMBER)
	@cat ./manifest.json

qa:
	@docker run --name $(SERVICE) --env SERVICE_ENV=build --rm --network=local --entrypoint npm $(SERVICE):$(TRAVIS_BUILD_NUMBER) run qa --

archive:
	@docker login -u=$(DOCKER_USERNAME) -p=$(DOCKER_PASSWORD) $(DOCKER_HOST)
	@docker run -d -p 3000:3000 --env SERVICE_ENV=live --name $(SERVICE) --network=local $(SERVICE):$(TRAVIS_BUILD_NUMBER)
	docker ps
	@CONTAINER_ID=`docker ps | grep $(SERVICE) | awk '{print $$1}'` && \
	docker commit $$CONTAINER_ID $(DOCKER_HOST)/$(DOCKER_ACCOUNT)/$(SERVICE)
	docker push $(DOCKER_HOST)/$(DOCKER_ACCOUNT)/$(SERVICE)

check:
	@echo "Checking our container is up and running..."
	@curl http://localhost:3000/__/manifest

ensure-dependencies:
	@npm run docker