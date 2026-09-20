build-ListFn:
	bun build src/handlers/list.ts --outdir $(ARTIFACTS_DIR)/src/handlers --target node --format cjs --external "@aws-sdk/*"

build-RecommendFn:
	bun build src/handlers/recommend.ts --outdir $(ARTIFACTS_DIR)/src/handlers --target node --format cjs --external "@aws-sdk/*"

build-RefreshFn:
	bun build src/handlers/refresh.ts --outdir $(ARTIFACTS_DIR)/src/handlers --target node --format cjs --external "@aws-sdk/*"
