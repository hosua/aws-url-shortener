import { Construct, IConstruct } from "constructs";
import { Duration, Stack, StackProps } from "aws-cdk-lib/core";
import * as cdk from "aws-cdk-lib";

import * as api_gw from "aws-cdk-lib/aws-apigatewayv2";
import * as api_gw_integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as cf from "aws-cdk-lib/aws-cloudfront";
import * as cr from "aws-cdk-lib/custom-resources";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as logs from "aws-cdk-lib/aws-logs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";

import * as path from "path";
import { getOrCreateBucketUuid, WEBSITE_BUILD_PATH } from "./env";
import { writeBucketNameToEnv, writeStackNameToEnv } from "./configWriter";

const bucketUuid = getOrCreateBucketUuid();

export class AwsUrlShortenerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const s3bucket = new s3.Bucket(this, `urlShortenerFrontend`, {
      bucketName: `url-shortener-frontend-${bucketUuid}`,
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
    });

    const s3bucketDeployment = new s3Deployment.BucketDeployment(
      this,
      `bucketDeployment`,
      {
        destinationBucket: s3bucket,
        sources: [
          s3Deployment.Source.asset(
            path.resolve(__dirname, WEBSITE_BUILD_PATH),
          ),
        ],
      },
    );

    const cfDist = new cf.Distribution(this, `cfDist`, {
      defaultRootObject: "index.html",
      defaultBehavior: {
        allowedMethods: cf.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        compress: true,
        origin: new origins.S3StaticWebsiteOrigin(s3bucket),
        viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 403,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(30),
        },
      ],
      minimumProtocolVersion: cf.SecurityPolicyProtocol.TLS_V1_2_2019,
    });

    const urlTable = new dynamodb.Table(this, "urlShortenerTable", {
      partitionKey: { name: "short_url", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "expire_at",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const lambdaUrlShortener = new lambda.Function(this, "shortenUrlLambda", {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "url_shortener.handler",
      code: lambda.Code.fromAsset(
        path.resolve(__dirname, "lambdas", "urlShortener"),
      ),
      environment: {
        region: this.region,
        table_name: urlTable.tableName,
      },
    });

    urlTable.grantWriteData(lambdaUrlShortener);

    const lambdaGetUrl = new lambda.Function(this, "getUrlLambda", {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "get_url.handler",
      code: lambda.Code.fromAsset(
        path.resolve(__dirname, "lambdas", "urlShortener"),
      ),
      environment: {
        region: this.region,
        table_name: urlTable.tableName,
      },
    });

    urlTable.grantReadData(lambdaGetUrl);

    const httpApi = new api_gw.HttpApi(this, "apiGateway", {
      apiName: `urlShortenerApiGateway`,
      description: "The HTTP REST API for URL Shortener",
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [api_gw.CorsHttpMethod.GET, api_gw.CorsHttpMethod.POST],
        allowHeaders: ["Content-Type"],
      },
    });

    httpApi.addRoutes({
      path: "/url",
      methods: [api_gw.HttpMethod.GET],
      integration: new api_gw_integrations.HttpLambdaIntegration(
        "getUrlIntegration",
        lambdaGetUrl,
      ),
    });

    httpApi.addRoutes({
      path: "/url",
      methods: [api_gw.HttpMethod.POST],
      integration: new api_gw_integrations.HttpLambdaIntegration(
        "shortenUrlIntegration",
        lambdaUrlShortener,
      ),
    });

    const apiUrl = httpApi.url || "";
    const region = this.region;

    const configLambda = new lambda.Function(this, "configWriterLambda", {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        path.resolve(__dirname, "lambdas", "configWriter"),
      ),
      timeout: Duration.seconds(30),
    });

    s3bucket.grantWrite(configLambda);

    const configProvider = new cr.Provider(this, "configProvider", {
      onEventHandler: configLambda,
    });

    const configResource = new cdk.CustomResource(this, "configResource", {
      serviceToken: configProvider.serviceToken,
      properties: {
        ApiUrl: apiUrl,
        Region: region,
        BucketName: s3bucket.bucketName,
      },
    });

    configResource.node.addDependency(s3bucketDeployment);

    cdk.Aspects.of(this).add(
      new (class implements cdk.IAspect {
        visit(node: IConstruct) {
          if (node instanceof logs.LogGroup) {
            node.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
          }
        }
      })(),
    );

    const bucketNameValue = `url-shortener-frontend-${bucketUuid}`;
    writeBucketNameToEnv(bucketNameValue);
    writeStackNameToEnv(this.stackName);

    new cdk.CfnOutput(this, "ApiGatewayUrl", {
      value: apiUrl,
      description: "API Gateway URL",
    });

    new cdk.CfnOutput(this, "FrontendBucketName", {
      value: s3bucket.bucketName,
      description: "S3 bucket name for frontend",
    });

    new cdk.CfnOutput(this, "CloudFrontDistributionUrl", {
      value: cfDist.domainName,
      description: "CloudFront URL (visit me to see the app)",
    });
  }
}
