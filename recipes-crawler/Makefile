start:
	@docker run -d -p 3001:3001 --env SERVICE_ENV=live --env F2F_KEY=$(F2F_KEY) --name $(SERVICE) --network=local $(SERVICE):$(TRAVIS_BUILD_NUMBER)

include ../Makefile
