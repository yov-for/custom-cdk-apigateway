import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration, Period, EndpointType, RestApi, ApiKey, ApiKeySourceType, UsagePlan, Deployment, Stage, LogGroupLogDestination, AccessLogFormat, MethodLoggingLevel, CfnAccount } from 'aws-cdk-lib/aws-apigateway';
import { join } from 'path';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
      endpointConfiguration: { types: [EndpointType.REGIONAL] },
      apiKeySourceType: ApiKeySourceType.HEADER,
      deploy: false,
    })

    const fnItems = new Function(this, 'ItemsHandler', {
      functionName: 'lambda-function-items',
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('lambda'),
      handler: 'items.handler',
    })
    // hello.addPermission('service invocation', {
    //   principal: new ServicePrincipal('apigateway.amazonaws.com'),
    //   sourceArn: myapi.arnForExecuteApi('*')
    // })
    const fnBooks = new Function(this, 'BooksHandler', {
      functionName: 'lambda-function-books',
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('lambda'),
      handler: 'books.handler',
    })
    const fnBook = new Function(this, 'BookHandler', {
      functionName: 'lambda-function-book',
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset('lambda'),
      handler: 'book.handler',
    })
    // bye.addPermission('service invocation', {
    //   principal: new ServicePrincipal('apigateway.amazonaws.com'),
    //   sourceArn: myapi.arnForExecuteApi('*')
    // })
    
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
    // items.addMethod('GET', new LambdaIntegration(hello));
    items.addMethod('GET', new LambdaIntegration(fnItems), { apiKeyRequired: true });
    item.addMethod('GET', new LambdaIntegration(fnItems), { apiKeyRequired: true });
    books.addMethod('GET', new LambdaIntegration(fnBooks), { apiKeyRequired: true })
    book.addMethod('GET', new LambdaIntegration(fnBook), { apiKeyRequired: true });
    books_aux.addMethod('GET', new LambdaIntegration(fnBooks), { apiKeyRequired: true })

    const dev_deploy = new Deployment(this, 'dev_deploy' + new Date().toISOString(), {
      api: myapi,
      // retainDeployments: true
    })
    const dev_stage = new Stage(this, 'dev_stage', {
      deployment: dev_deploy,
      stageName: 'dev',
      variables: {
        'lambda_alias': 'dev'
      },
    });
    usagePlan.addApiStage({stage: dev_stage});

    // const testLogGroup = new LogGroup(this, 'TestLogs');
    const test_deploy = new Deployment(this, 'test_deploy' + new Date().toISOString(), {
      api: myapi,
      // retainDeployments: true
    })
    const test_stage = new Stage(this, 'test_stage', {
      deployment: test_deploy,
      // accessLogDestination: new LogGroupLogDestination(testLogGroup),
      // accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
      stageName: 'test',
      variables: {
        'lambda_alias': 'test'
      }
    });
    usagePlan.addApiStage({stage: test_stage});

    // const prodLogGroup = new LogGroup(this, 'ProdLogs');
    const prod_deploy = new Deployment(this, 'prod_deploy' + new Date().toISOString(), {
      api: myapi,
      retainDeployments: true
    })
    const prod_stage = new Stage(this, 'prod_stage', {
      deployment: prod_deploy,
      // accessLogDestination: new LogGroupLogDestination(prodLogGroup),
      // accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
      stageName: 'prod',
      variables: {
        'lambda_alias': 'prod'
      },
      // methodOptions: {
      //   '/*/*': {
      //     loggingLevel: MethodLoggingLevel.INFO,
      //   }
      // }
    });
    usagePlan.addApiStage({stage: prod_stage});



  
  }
}
