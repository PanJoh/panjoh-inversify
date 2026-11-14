#!/usr/bin/env bash

npm i

cd packages/inversify-http-zod

if [ "$PROD" = "true" ]; then
    npm run build
else
    npm run build:dev
fi
