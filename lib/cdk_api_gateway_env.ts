import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration, Period, EndpointType, RestApi, ApiKey, ApiKeySourceType, UsagePlan, Deployment, Stage, LogGroupLogDestination, AccessLogFormat, MethodLoggingLevel, CfnAccount } from 'aws-cdk-lib/aws-apigateway';
import { join } from 'path';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

interface MyApiStackProps extends cdk.StackProps {
  environment: string;
}

export class CdkApiGatewayEnvStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MyApiStackProps) {
    super(scope, id, props);

    const environment = this.node.tryGetContext('env');

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkApiGatewayQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const apiGatewayLoggingRole = new Role(this, 'ApiGatewayLoggingRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs'),
      ]
    });

    new CfnAccount(this, 'ApiGatewayAccountSetting', {
      cloudWatchRoleArn: apiGatewayLoggingRole.roleArn,
    });
  
    const myapi = new RestApi(this, 'myapi', {
      restApiName: `myapi-${props.environment}`,
      endpointConfiguration: { types: [EndpointType.REGIONAL] },
      apiKeySourceType: ApiKeySourceType.HEADER,
      deploy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: ['*']
      }
    })
    const fnItems = new Function(this, 'ItemsHandler', {
      functionName: `lambda-function-items-${props.environment}`,
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('lambda'),
      handler: 'items.handler',
    })
    const fnBooks = new Function(this, 'BooksHandler', {
      functionName: `lambda-function-books-${props.environment}`,
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('lambda'),
      handler: 'books.handler',
    })
    const fnBook = new Function(this, 'BookHandler', {
      functionName: `lambda-function-book-${props.environment}`,
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('lambda'),
      handler: 'book.handler',
    })
    
    const apiKey = new ApiKey(this, 'myApiKey');
    
    const usagePlan = myapi.addUsagePlan('Usage Plan', {
      name: 'Usage Plan',
      
      quota: {
        limit: 100,
        period: Period.DAY
      },
      throttle: {
        burstLimit: 2,
        rateLimit: 2
      },
    });

    usagePlan.addApiKey(apiKey)
    // const my_auth_lambda = new Function(this, 'MyAuthorizer', {
    //   runtime: Runtime.NODEJS_20_X,
    //   code: Code.fromAsset('lambda'),
    //   handler: 'my_authorizer.handler'
    // })
    // const ApiAuthorizer = new TokenAuthorizer(this, 'MyTokenAuth', {
    //   handler: my_auth_lambda
    // })

    const items = myapi.root.addResource('items');
    const item = items.addResource('{itemid}');
    const books = myapi.root.addResource('books');
    const book = books.addResource('{bookId}');
    const books_aux = myapi.root.addResource('books_aux');
    items.addMethod('GET', new LambdaIntegration(fnItems), { apiKeyRequired: true });
    item.addMethod('GET', new LambdaIntegration(fnItems), { apiKeyRequired: true });
    books.addMethod('GET', new LambdaIntegration(fnBooks), { apiKeyRequired: true })
    book.addMethod('GET', new LambdaIntegration(fnBook), { apiKeyRequired: true });
    books_aux.addMethod('GET', new LambdaIntegration(fnBooks), { apiKeyRequired: true })

    const v0_1_deploy = new Deployment(this, 'v0.1', {
      api: myapi,
      retainDeployments: environment == 'prod' ? true : false 
    })
    const my_stage = new Stage(this, 'v0', {
      deployment: v0_1_deploy,
      stageName: 'v0',
      variables: {
        'lambda_alias': `${environment}`
      },
    });
    usagePlan.addApiStage({stage: my_stage});
  
  }
}
