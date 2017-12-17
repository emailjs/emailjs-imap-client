#!/bin/bash

npm run build-worker
rm -rf $PWD/dist
babel src --out-dir dist --ignore '**/*-unit.js','**/*-integration.js','**/*-worker.js' --source-maps inline
