#!/bin/bash

npm run build-worker
rm -rf $PWD/dist
babel src --out-dir dist --ignore '**/*-unit.js' --source-maps inline
git reset
git add $PWD/dist
git commit -m 'Updating dist files' -n
