import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { ApiGatewayEnvStage } from './cdk_apigateway_env-stage';

export class ApiPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const devPipeline = new CodePipeline(this, 'DevPipeline', {
      pipelineName: 'DevPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('yov-for/custom-cdk-apigateway', 'dev', { authentication: cdk.SecretValue.secretsManager('github-token') }),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    });

    devPipeline.addStage(new ApiGatewayEnvStage(this, 'Dev', {
      env: { account: '894779240827', region: 'us-east-1' },
      environment: 'dev'
    }));
    
    // const testPipeline = new CodePipeline(this, 'TestPipeline', {
    //   pipelineName: 'TestPipeline',
    //   synth: new ShellStep('Synth', {
    //     input: CodePipelineSource.gitHub('yov-for/custom-cdk-apigateway', 'test', { authentication: cdk.SecretValue.secretsManager('github-token') }),
    //     commands: ['npm ci', 'npx cdk synth']
    //   })
    // });

    // testPipeline.addStage(new ApiGatewayEnvStage(this, 'Test', {
    //   env: { account: '894779240827', region: 'us-east-1' },
    //   environment: 'test'
    // }));


  }
}