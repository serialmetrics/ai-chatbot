#!/bin/bash

IMAGE_NAME=$(cat .env | grep -oP 'DOCKER_IMAGE_NAME = \K(\w+)')
PORT=$(cat .env | grep -oP 'DOCKER_PORT = \K(\w+)')

docker build -t $IMAGE_NAME --build-arg port=$PORT .
