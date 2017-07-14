start:
	@docker run -d -p 3001:3001 --env SERVICE_ENV=build --name $(SERVICE) --network=local $(SERVICE):$(TRAVIS_BUILD_NUMBER)

include ../Makefile
