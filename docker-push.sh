#!/bin/bash

# Extract the version number from package.json using jq
VERSION=$(jq -r .version package.json)

# Name of the buildx builder to use
BUILDER_NAME=multiarch-builder

# Ensure we're using the correct builder
if ! docker buildx inspect "$BUILDER_NAME" > /dev/null 2>&1; then
  echo "Error: Builder '$BUILDER_NAME' not found. Please run ./docker-build.sh first."
  exit 1
fi

docker buildx use "$BUILDER_NAME"

echo "Pushing images for version: $VERSION"
echo "Pushing iankulin/mdserver:$VERSION"
docker buildx imagetools create --tag iankulin/mdserver:$VERSION iankulin/mdserver:$VERSION

echo "Pushing iankulin/mdserver:latest"
docker buildx imagetools create --tag iankulin/mdserver:latest iankulin/mdserver:latest

echo "Push completed successfully!"