import * as fs from "fs";
import * as path from "path";
import { setEnvValue } from "./env";

interface DeployScriptConfig {
  stackName: string;
  websiteSrcPath: string;
}

export const writeDeployScript = ({
  stackName,
  websiteSrcPath,
}: DeployScriptConfig): void => {
  const deployScriptPath = path.join(websiteSrcPath, "deploy-frontend.sh");
  const deployScriptContent = `#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$(cd "$SCRIPT_DIR/.." && pwd)/.env"
DIST_DIR="$SCRIPT_DIR/dist"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env file not found at $ENV_FILE"
  echo "Make sure the stack is deployed: npm run deploy"
  exit 1
fi

source "$ENV_FILE"

if [ -z "$BUCKET_NAME" ]; then
  echo "Error: BUCKET_NAME not set in .env file"
  echo "Make sure the stack is deployed: npm run deploy"
  exit 1
fi

STACK_NAME="${stackName}"

echo "Fetching stack outputs from CDK stack: $STACK_NAME"
STACK_OUTPUTS=$(aws cloudformation describe-stacks \\
  --stack-name "$STACK_NAME" \\
  --query "Stacks[0].Outputs" \\
  --output json)

API_URL=$(echo "$STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey=="ApiGatewayUrl") | .OutputValue')
STACK_ID=$(aws cloudformation describe-stacks \\
  --stack-name "$STACK_NAME" \\
  --query "Stacks[0].StackId" \\
  --output text)
REGION=$(echo "$STACK_ID" | cut -d: -f4)

if [ -z "$API_URL" ] || [ "$API_URL" == "None" ]; then
  echo "Error: Could not fetch API_URL from stack outputs"
  echo "Make sure the stack is deployed: npm run deploy"
  exit 1
fi

if [ -z "$REGION" ] || [ "$REGION" == "None" ]; then
  echo "Error: Could not fetch REGION from stack outputs"
  echo "Make sure the stack is deployed: npm run deploy"
  exit 1
fi

if [ ! -d "$DIST_DIR" ]; then
  echo "Error: dist directory not found at $DIST_DIR"
  echo "Please run 'npm run build' in the website-src directory first"
  exit 1
fi

echo "Emptying S3 bucket: $BUCKET_NAME"
aws s3 rm "s3://$BUCKET_NAME" --recursive

echo "Uploading new build to S3 bucket: $BUCKET_NAME"
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" --delete

echo "Writing config.json to S3 bucket"
CONFIG_JSON=$(cat <<EOF
{
  "apiBaseUrl": "$API_URL",
  "region": "$REGION"
}
EOF
)

echo "$CONFIG_JSON" | aws s3 cp - "s3://$BUCKET_NAME/config.json" --content-type "application/json"

echo "Deployment complete!"
`;

  fs.writeFileSync(deployScriptPath, deployScriptContent);
  fs.chmodSync(deployScriptPath, 0o755);
};

export const writeBucketNameToEnv = (bucketName: string): void => {
  setEnvValue("BUCKET_NAME", bucketName);
};
