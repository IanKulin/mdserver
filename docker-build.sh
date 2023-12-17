#!/bin/bash

# Extract the version number from package.json using jq
VERSION=$(jq -r .version package.json)

echo docker buildx build --push --platform linux/arm64,linux/amd64 -t iankulin/mdserver:$VERSION -t iankulin/mdserver:latest .
docker buildx build --push --platform linux/arm64,linux/amd64 -t iankulin/mdserver:$VERSION -t iankulin/mdserver:latest .
