SERVICE_PORT=3001

start:
	@docker run -d -p $(SERVICE_PORT):$(SERVICE_PORT) -e SERVICE_ENV=live -e RABBIT_PWD=$(RABBIT_PWD) -e F2F_KEY=$(F2F_KEY) -e SUMO_URL=$(SUMO_URL) --name $(SERVICE) --network=local $(SERVICE):$(TRAVIS_BUILD_NUMBER)

include ../Makefile
