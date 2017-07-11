lint:
	@node_modules/.bin/eslint .

qa:
	@make lint && npm run test

ensure-dependencies:
	@npm run docker