#!/bin/bash

# Extract the version number from package.json using jq
VERSION=$(jq -r .version package.json)

echo docker build --platform linux/amd64 -t iankulin/mdserver:$VERSION -t iankulin/mdserver:latest .
docker build --platform linux/amd64 -t iankulin/mdserver:$VERSION -t iankulin/mdserver:latest .
echo docker build --platform linux/arm64 -t iankulin/mdserver:arm64-$VERSION -t iankulin/mdserver:arm64-latest .
docker build --platform linux/arm64 -t iankulin/mdserver:arm64-$VERSION -t iankulin/mdserver:arm64-latest .

echo docker push iankulin/mdserver:arm64-$VERSION 
docker push iankulin/mdserver:arm64-$VERSION 
echo docker push iankulin/mdserver:arm64-latest 
docker push iankulin/mdserver:arm64-latest 

echo docker push iankulin/mdserver:$VERSION
docker push iankulin/mdserver:$VERSION
echo docker push iankulin/mdserver:latest 
docker push iankulin/mdserver:latest 