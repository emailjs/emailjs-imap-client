#!/bin/bash

set -e

rm -rf $PWD/dist
npm run build-worker
babel src --out-dir dist --ignore '**/*-unit.js' --source-maps inline
git reset
git add $PWD/dist
git commit -m 'Updating dist files' -n
