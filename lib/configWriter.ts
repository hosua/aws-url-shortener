import { setEnvValue } from "./env";

export const writeBucketNameToEnv = (bucketName: string): void => {
  setEnvValue("BUCKET_NAME", bucketName);
};

export const writeStackNameToEnv = (stackName: string): void => {
  setEnvValue("STACK_NAME", stackName);
};
