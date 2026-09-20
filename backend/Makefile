build-ListFn:
	bun build src/handlers/list.ts --outfile $(ARTIFACTS_DIR)/list.js --target node --format cjs --external "@aws-sdk/*"

build-RecommendFn:
	bun build src/handlers/recommend.ts --outfile $(ARTIFACTS_DIR)/recommend.js --target node --format cjs --external "@aws-sdk/*"

build-RefreshFn:
	bun build src/handlers/refresh.ts --outfile $(ARTIFACTS_DIR)/refresh.js --target node --format cjs --external "@aws-sdk/*"

build-HealthFn:
	bun build src/handlers/health.ts --outfile $(ARTIFACTS_DIR)/health.js --target node --format cjs --external "@aws-sdk/*"
