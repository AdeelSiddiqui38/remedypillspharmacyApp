import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

// DigitalOcean Spaces is S3-API-compatible, so the AWS SDK works against it
// by pointing at the Spaces endpoint instead of S3's. Used instead of local
// disk storage because the app server (DO App Platform) doesn't guarantee
// persistent disk across deploys/restarts.
let cachedClient: { s3: S3Client; bucket: string; publicBaseUrl: string } | null = null;

function getClient() {
  if (cachedClient) return cachedClient;

  const region = process.env.SPACES_REGION;
  const bucket = process.env.SPACES_BUCKET;
  const key = process.env.SPACES_KEY;
  const secret = process.env.SPACES_SECRET;

  if (!region || !bucket || !key || !secret) {
    throw new Error(
      "Missing DigitalOcean Spaces env vars. Required: SPACES_REGION, SPACES_BUCKET, SPACES_KEY, SPACES_SECRET",
    );
  }

  const endpoint = `https://${region}.digitaloceanspaces.com`;
  const s3 = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId: key, secretAccessKey: secret },
  });

  cachedClient = { s3, bucket, publicBaseUrl: `https://${bucket}.${region}.digitaloceanspaces.com` };
  return cachedClient;
}

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimetype: string,
): Promise<{ url: string; key: string }> {
  const { s3, bucket, publicBaseUrl } = getClient();

  const ext = path.extname(originalName);
  const key = `sms-media/${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ACL: "public-read",
    }),
  );

  return { url: `${publicBaseUrl}/${key}`, key };
}
