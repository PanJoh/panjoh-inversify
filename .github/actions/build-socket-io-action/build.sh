#!/usr/bin/env bash

npm i

cd packages/inversify-socket-io

if [ "$PROD" = "true" ]; then
    npm run build
else
    npm run build:dev
fi
