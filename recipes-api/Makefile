SERVICE_PORT=3000

start:
	@docker run -d -p $(SERVICE_PORT):$(SERVICE_PORT) -e SERVICE_ENV=live -e MONGO_URL=$(MONGO_URL) -e RABBIT_PWD=$(RABBIT_PWD) --name $(SERVICE) --network=local $(SERVICE):$(TRAVIS_BUILD_NUMBER)

# CONTINUOS DEPLOYMENT

ensure-ec2-instance:
	# this shouldn't be here - it's just a quick way to execute it only once at the beginning
	@echo "Ensuring there is a EC2 instance available..."
	@pwd
	@node ../recipes-infra/prepare-ec2-instance

include ../Makefile
