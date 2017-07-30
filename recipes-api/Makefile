 SERVICE_PORT=3000

start:
	@docker run -d -p $(SERVICE_PORT):$(SERVICE_PORT) --env SERVICE_ENV=live MONGO_URL=$(MONGO_URL) RABBIT_PWD=$(RABBIT_PWD) --name $(SERVICE) --network=local $(SERVICE):$(TRAVIS_BUILD_NUMBER)

include ../Makefile
