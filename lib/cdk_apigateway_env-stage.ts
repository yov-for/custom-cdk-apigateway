import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { CdkApiGatewayEnvStack } from './cdk_api_gateway_env';

interface ApiGatewayEnvStageProps extends cdk.StageProps {
  environment: string;
}

export class ApiGatewayEnvStage extends cdk.Stage {

    constructor(scope: Construct, id: string, props: ApiGatewayEnvStageProps) {
      super(scope, id, props);

      const apigatewayStack = new CdkApiGatewayEnvStack(this, 'ApiGatewayStack', props);
    }
}