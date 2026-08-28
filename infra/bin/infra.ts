#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { RotomEarpieceStack } from '../lib/rotom-earpiece-stack';

const app = new App();
new RotomEarpieceStack(app, 'RotomEarpieceStack', {
  env: { region: 'us-east-1' },
});
