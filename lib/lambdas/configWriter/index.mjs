import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const handler = async (event) => {
  const s3Client = new S3Client({});
  const requestType = event.RequestType;
  const props = event.ResourceProperties;

  if (requestType === "Delete") {
    return { PhysicalResourceId: event.PhysicalResourceId || "config" };
  }

  const config = {
    apiBaseUrl: props.ApiUrl || "",
    region: props.Region || "",
  };

  await s3Client.send(
    new PutObjectCommand({
      Bucket: props.BucketName,
      Key: "config.json",
      Body: JSON.stringify(config, null, 2),
      ContentType: "application/json",
    }),
  );

  return {
    PhysicalResourceId: "config",
    Data: { ConfigWritten: "true" },
  };
};
