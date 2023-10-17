#!/bin/bash

IMAGE_NAME=$(cat .env | grep -oP 'DOCKER_IMAGE_NAME = \K(\w+)')
CONTR_NAME=$(cat .env | grep -oP 'DOCKER_CONTAINER_NAME = \K(\w+)')
PORT=$(cat .env | grep -oP 'DOCKER_PORT = \K(\w+)')

docker run -it --rm \
    --name $CONTR_NAME \
    -p $PORT:$PORT \
    $IMAGE_NAME
