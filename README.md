# AWS URL Shortener

This project is a simple URL shortener that deploys a stack using the AWS CDK.


### Getting started

1. First, you'll want to make sure that you have the aws cdk installed. 

    If you use `npm`, you can do a global install with: 

        npm install -g aws-cdk

2. Run `npm install` to install all packages

3. If you haven't the `cdk` before, you'll need to initialize `cdk` in AWS with:

        npx run cdk bootstrap

    This will create a bucket in s3.

4. Next, build the frontend files with `npm run build:frontend`

5. Finally, run `npm run deploy` to deploy the stack to AWS. Type `y` to confirm when prompted.


### Some notes

Once it is deployed, you can view the app via the `CloudFrontDistributionUrl`.
You should see it in the outputs when the deployment finishes. If you want to
associate the Route with your own custom domain, you'll need to set that up
yourself.

If you decide to modify any of the frontend files, `npm run deploy` (or `npx
cdk deploy`) will not detect changes in the frontend. To update the frontend,
you'll need run `npm run build:frontend`, then `npm run deploy:frontend` script
which will reupload the `dist` files to s3.

In order to fully delete the stack, you will need to empty the frontend s3
bucket first, otherwise it will fail to delete.

### Architecture

![url-shortener](images/url-shortener-diagram.webp)
