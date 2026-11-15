#!/usr/bin/env bash

git tag -d "av${1}" 
git push origin -d "av${1}"