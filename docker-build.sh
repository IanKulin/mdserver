#!/bin/bash

# Extract the version number from package.json using jq
VERSION=$(jq -r .version package.json)

# Name of the buildx builder to use
BUILDER_NAME=multiarch-builder

# Check if the builder already exists
if ! docker buildx inspect "$BUILDER_NAME" > /dev/null 2>&1; then
  echo "Creating buildx builder: $BUILDER_NAME"
  docker buildx create --name "$BUILDER_NAME" --use
else
  echo "Using existing buildx builder: $BUILDER_NAME"
  docker buildx use "$BUILDER_NAME"
fi

# Bootstrap the builder (ensures it's ready for multi-platform builds)
docker buildx inspect --bootstrap

echo docker buildx build --push --platform linux/arm64,linux/amd64 -t iankulin/mdserver:$VERSION -t iankulin/mdserver:latest .
docker buildx build --push --platform linux/arm64,linux/amd64 -t iankulin/mdserver:$VERSION -t iankulin/mdserver:latest .