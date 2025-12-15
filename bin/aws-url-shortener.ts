#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { AwsUrlShortenerStack } from '../lib/aws-url-shortener-stack';

const app = new cdk.App();
new AwsUrlShortenerStack(app, 'AwsUrlShortenerStack');
