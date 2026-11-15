#!/usr/bin/env bash

git tag -a "av${1}" -m "action version ${1}"
git push origin "av${1}"