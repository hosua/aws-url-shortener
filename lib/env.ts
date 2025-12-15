import * as fs from "fs";

import { randomUUID } from "crypto";

const WEBSITE_BUILD_PATH = "../website-src/dist";

const envPath = ".env";

const getOrCreateBucketUuid = (): string => {
  let bucketUuid = process.env.BUCKET_UUID;
  if (!bucketUuid) {
    // Try to read from .env file
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const match = envContent.match(/^BUCKET_UUID=(.+)$/m);
      bucketUuid = match?.[1]?.trim();
    }
    // Generate new UUID if still not found
    if (!bucketUuid) {
      bucketUuid = randomUUID();
      const envLine = fs.existsSync(envPath)
        ? `\nBUCKET_UUID=${bucketUuid}\n`
        : `BUCKET_UUID=${bucketUuid}\n`;
      fs.writeFileSync(envPath, envLine, {
        flag: fs.existsSync(envPath) ? "a" : "w",
      });
    }
  }
  return bucketUuid;
};

export { getOrCreateBucketUuid, WEBSITE_BUILD_PATH };
