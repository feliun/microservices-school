start:
	@docker run -d -p 3000:3000 --env SERVICE_ENV=live --name $(SERVICE) --network=local $(SERVICE):$(TRAVIS_BUILD_NUMBER)

include ../Makefile
