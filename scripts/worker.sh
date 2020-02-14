#!/bin/bash

rm -f $PWD/res/compression.worker.blob
webpack -p
mv $PWD/res/compression.worker.js $PWD/res/compression.worker.blob
