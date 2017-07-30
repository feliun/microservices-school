SERVICE_PORT=3001

start:
	@docker run -d -p $(SERVICE_PORT):$(SERVICE_PORT) --env SERVICE_ENV=live --env RABBIT_PWD=$(RABBIT_PWD) F2F_KEY=$(F2F_KEY) --name $(SERVICE) --network=local $(SERVICE):$(TRAVIS_BUILD_NUMBER)

include ../Makefile
