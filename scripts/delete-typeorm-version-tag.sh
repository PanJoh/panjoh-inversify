#!/usr/bin/env bash

git tag -d "typeorm@v${1}"
git push origin -d "typeorm@v${1}"