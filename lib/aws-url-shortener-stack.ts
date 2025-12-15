import { Duration, Stack, StackProps } from "aws-cdk-lib/core";
import * as api_gw from "aws-cdk-lib/aws-apigatewayv2";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import * as path from "path";
import { getOrCreateBucketUuid, WEBSITE_BUILD_PATH } from "./env";

const bucketUuid = getOrCreateBucketUuid();

export class AwsUrlShortenerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const s3bucket = new s3.Bucket(this, `urlShortenerFrontend`, {
      bucketName: `url-shortener-frontend-${bucketUuid}`,
      accessControl: s3.BucketAccessControl.PRIVATE,
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

    const cfDist = new cloudfront.Distribution(this, `cfDist`, {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new origins.S3StaticWebsiteOrigin(s3bucket),
      },
    });

    const lambdaUrlShortener = new lambda.Function(this, "shortenUrlLambda", {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "url_shortener.handler",
      code: lambda.Code.fromAsset(
        path.resolve(__dirname, "lambdas", "urlShortener"),
      ),
    });

    const lambdaGetUrl = new lambda.Function(this, "getUrlLambda", {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "get_url.handler",
      code: lambda.Code.fromAsset(
        path.resolve(__dirname, "lambdas", "urlShortener"),
      ),
    });

    const apiGw = new api_gw.HttpApi(this, "apiGateway", {
      apiName: `urlShortenerApiGateway`,
      description: "The HTTP REST API for URL Shortener",
      // TODO: This is going to need a CORS configuration
    });
  }
}
