#!/usr/bin/env bash

git tag -a "typeorm@v${1}" -m "typeorm version ${1}"
git push origin "typeorm@v${1}"
