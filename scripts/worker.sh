#!/bin/bash

rm $PWD/res/compression.worker.blob
webpack -p
mv $PWD/res/compression.worker.js $PWD/res/compression.worker.blob
git reset
git add $PWD/res/compression.worker.blob
git commit -m 'Updating worker blob' -n
