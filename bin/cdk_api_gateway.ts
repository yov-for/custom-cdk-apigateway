#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkApiGatewayStack } from '../lib/cdk_api_gateway-stack';
import { CdkApiGatewayEnvStack } from '../lib/cdk_api_gateway_env';

const app = new cdk.App();
// new CdkApiGatewayEnvStack(app, 'CdkApiGatewayEnvStack', {
//   /* If you don't specify 'env', this stack will be environment-agnostic.
//    * Account/Region-dependent features and context lookups will not work,
//    * but a single synthesized template can be deployed anywhere. */

//   /* Uncomment the next line to specialize this stack for the AWS Account
//    * and Region that are implied by the current CLI configuration. */
//   // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

//   /* Uncomment the next line if you know exactly what Account and Region you
//    * want to deploy the stack to. */
//   environment: 'dev',
//   env: { account: '894779240827', region: 'us-east-1' },

//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });
new CdkApiGatewayEnvStack(app, 'CdkApiGatewayDevStack', {
  environment: 'dev',
  env: { account: '894779240827', region: 'us-east-1' },
});
new CdkApiGatewayEnvStack(app, 'CdkApiGatewayTestStack', {
  environment: 'test',
  env: { account: '894779240827', region: 'us-east-1' },
});
new CdkApiGatewayEnvStack(app, 'CdkApiGatewayProdStack', {
  environment: 'prod',
  env: { account: '894779240827', region: 'us-east-1' },
});

// new CdkApiGatewayStack(app, 'CdkApiGatewayStack', {
//   env: { account: '894779240827', region: 'us-east-1' }
// });

app.synth();