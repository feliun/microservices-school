SERVICE_PORT=3001

start:
	@docker run -d -p $(SERVICE_PORT):$(SERVICE_PORT) -e SERVICE_ENV=live -e RABBIT_PWD=$(RABBIT_PWD) -e F2F_KEY=$(F2F_KEY) --name $(SERVICE) --network=local $(SERVICE):$(TRAVIS_BUILD_NUMBER)

# CONTINUOS DEPLOYMENT
ensure-ec2-instance:
	@echo "Nothing to do here..."

include ../Makefile
