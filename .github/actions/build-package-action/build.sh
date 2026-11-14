#!/usr/bin/env bash

npm i

cd $PACKAGE_PATH

if [ "$PROD" = "true" ]; then
    npm run build
else
    npm run build:dev
fi
