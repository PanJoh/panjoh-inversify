#!/usr/bin/env bash

npm i

cd packages/inversify-typeorm

echo $PROD

if [ $PROD = "true" ]; then
    npm run build
else
    npm run build:dev
fi