#!/bin/bash

IMAGE_NAME=$(cat .env | grep -oP 'DOCKER_IMAGE_NAME = \K(\w+)')
CONTR_NAME=$(cat .env | grep -oP 'DOCKER_CONTAINER_NAME = \K(\w+)')
PORT=$(cat .env | grep -oP 'DOCKER_PORT = \K(\w+)')
UPLOAD_DIR=$(cat .env | grep -oP 'STORE_PATH=\K(\w+)')

docker run -it -d --rm \
    --name $CONTR_NAME \
    -p $PORT:$PORT \
    --mount src=`pwd`/${UPLOAD_DIR},target=/app/${UPLOAD_DIR},type=bind \
    $IMAGE_NAME
