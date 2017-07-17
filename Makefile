DOCKER_HOST=quay.io
DOCKER_ACCOUNT=feliun

# CONTINUOS INTEGRATION

package:
	@docker build --tag $(SERVICE):$(TRAVIS_BUILD_NUMBER) .
	@docker images

brand:
	@npm i make-manifest && node_modules/make-manifest/bin/make-manifest --extra "build.url: https://travis-ci.org/feliun/microservices-school/builds/"$(TRAVIS_BUILD_ID) --extra "build.number: "$(TRAVIS_BUILD_NUMBER)
	@cat ./manifest.json

qa:
	@docker run --name $(SERVICE) --env SERVICE_ENV=build --rm --network=local --entrypoint npm $(SERVICE):$(TRAVIS_BUILD_NUMBER) run qa --

archive: start
	@docker login -u=$(DOCKER_USERNAME) -p=$(DOCKER_PASSWORD) $(DOCKER_HOST)
	docker ps
	@CONTAINER_ID=`docker ps | grep $(SERVICE) | awk '{print $$1}'` && \
	docker commit $$CONTAINER_ID $(DOCKER_HOST)/$(DOCKER_ACCOUNT)/$(SERVICE)
	docker push $(DOCKER_HOST)/$(DOCKER_ACCOUNT)/$(SERVICE)

check:
	@echo "Checking our $(SERVICE) container is up and running..."
	@curl http://localhost:$(SERVICE_PORT)/__/manifest

# CONTINUOS DEPLOYMENT
prepare-deployment:
	@curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
	@chmod +x ./kubectl
	@sudo mv ./kubectl /usr/local/bin/kubectl
	@export AWS_ACCESS_KEY_ID=$(AWS_ACCESS_KEY_ID) # AIM programmatic credentials
	@export AWS_SECRET_ACCESS_KEY=$(AWS_SECRET_ACCESS_KEY)
	@npm i aws-cli -g
	@aws ec2 describe-instances # check connectivity

ensure-dependencies:
	@npm run docker