#!/bin/sh
cd ../vue
TARGET=electron npm run build
cd ../electron
npm start
