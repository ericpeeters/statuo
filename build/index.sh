#!/bin/bash

set -e

# cd to the root dir
root="$(pwd)/$(dirname "$0")/.."
cd "$root" || exit 1

PATH="$(npm bin):$PATH"
# XXX: $PACKAGE_OUTPUT_PATH must be an absolute path!
dir=${PACKAGE_OUTPUT_PATH:-"$root/dist"}

echo "- Clean the destination folder"
rm -rf "$dir"

echo "- Transpile to ES5 version"
env NODE_ENV='es5' babel src --source-root src --out-dir "$dir/" --ignore src/**/*.test.js --extensions .js --quiet
echo "- Transpile to ES6 version"
env NODE_ENV='es6' babel src --source-root src --out-dir "$dir/esm" --ignore src/**/*.test.js --extensions .js --quiet

echo "- Transform and copy package.json"
./build/transform.js

echo "- Remove test files from dist folder"
find "$dir" -type f -name "*.test.js" -delete

echo "- Copy README and License"
cp LICENSE.md $dir
cp README.md $dir
