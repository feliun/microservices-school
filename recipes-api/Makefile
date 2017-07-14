SERVICE_PORT=3000

check:
	@echo "Checking our $(SERVICE) container is up and running..."
	@curl http://localhost:$(SERVICE_PORT)/__/manifest

start:
	@docker run -d -p $(SERVICE_PORT):$(SERVICE_PORT) --env SERVICE_ENV=live --name $(SERVICE) --network=local $(SERVICE):$(TRAVIS_BUILD_NUMBER)

include ../Makefile
