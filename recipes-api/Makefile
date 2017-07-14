start:
	@docker run -d -p 3000:3000 --env SERVICE_ENV=build --name $(SERVICE) --network=local $(SERVICE):$(TRAVIS_BUILD_NUMBER)

include ../Makefile
