#!/bin/bash

npm install &&
  npm run build:frontend &&
  npm run cdk bootstrap &&
  npm run deploy
