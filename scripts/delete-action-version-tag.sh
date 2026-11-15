#!/usr/bin/env bash

git tag -d "av${1}" -m "action version ${1}"
git push origin "av${1}"