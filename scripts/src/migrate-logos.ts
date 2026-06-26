/**
 * Migration script: download co-organiser logos from external URLs and upload
 * to Replit object storage using the same presigned-URL flow as the API
 * (request presigned PUT URL from sidecar + PUT bytes to GCS), then update
 * the database settings to use the internal /objects/uploads/... paths.
 *
 * Run: pnpm --filter @workspace/scripts run migrate-logos
 *
 * Safe to re-run — skips logos whose settings key already points to an
 * internal /objects/... path.
 */

import { randomUUID } from "crypto";
import pg from "pg";

const { Client } = pg;

const SIDECAR = "http://127.0.0.1:1106";
const PRIVATE_OBJECT_DIR = process.env.PRIVATE_OBJECT_DIR;
const DATABASE_URL = process.env.DATABASE_URL;

if (!PRIVATE_OBJECT_DIR) {
  throw new Error(
    "PRIVATE_OBJECT_DIR not set. Ensure object storage is provisioned."
  );
}
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL not set.");
}

interface LogoSpec {
  key: string;
  sourceUrl: string;
  label: string;
}

const logos: LogoSpec[] = [
  {
    key: "co_organiser_tidrec_logo",
    sourceUrl:
      "https://tidrec.um.edu.my/images/Beige%20Pastel%20Minimalist%20Thesis%20Defense%20Presentation%20(400%20x%2070%20px)%20(1).png",
    label: "TIDREC",
  },
  {
    key: "co_organiser_msptm_logo",
    sourceUrl:
      "https://msptm.org/wp-content/uploads/2024/02/MSPTM-Logo-No-BG-12Mar2022-ver2.png",
    label: "MSPTM",
  },
  {
    key: "venue_logo",
    sourceUrl:
      "https://image-tc.galaxy.tf/wipng-14z269ss45xgkfia6m5zxupd6/sunway-putra-hotel-kuala-lumpur.png",
    label: "Sunway Putra Hotel",
  },
];

/**
 * Mirrors the ObjectStorageService.getObjectEntityUploadURL() method and
 * the POST /api/storage/uploads/request-url endpoint:
 * asks the Replit sidecar for a presigned PUT URL for a new object entity.
 * Returns the signed URL and the normalised /objects/uploads/<uuid> path.
 */
async function requestUploadUrl(): Promise<{
  signedUrl: string;
  objectPath: string;
}> {
  const objectId = randomUUID();
  const objectDir = PRIVATE_OBJECT_DIR!.endsWith("/")
    ? PRIVATE_OBJECT_DIR!
    : `${PRIVATE_OBJECT_DIR}/`;
  const fullGcsPath = `${objectDir}uploads/${objectId}`;

  const pathParts = fullGcsPath.replace(/^\//, "").split("/");
  const bucketName = pathParts[0];
  const objectName = pathParts.slice(1).join("/");

  const res = await fetch(`${SIDECAR}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName,
      object_name: objectName,
      method: "PUT",
      expires_at: new Date(Date.now() + 900_000).toISOString(),
    }),
  });

  if (!res.ok) {
    throw new Error(`Sidecar error ${res.status}: ${await res.text()}`);
  }

  const { signed_url } = (await res.json()) as { signed_url: string };
  const objectPath = `/objects/uploads/${objectId}`;
  return { signedUrl: signed_url, objectPath };
}

/**
 * Mirrors the client-side PUT to the presigned URL:
 * uploads image bytes directly to GCS via the signed URL.
 */
async function putToSignedUrl(
  signedUrl: string,
  imageBuffer: ArrayBuffer,
  contentType: string
): Promise<void> {
  const res = await fetch(signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(imageBuffer.byteLength),
    },
    body: imageBuffer,
  });

  if (!res.ok) {
    throw new Error(`GCS upload failed: ${res.status} ${await res.text()}`);
  }
}

async function migrateOneLogo(
  client: pg.Client,
  logo: LogoSpec
): Promise<void> {
  // Skip if already pointing to internal storage
  const existing = await client.query<{ value: string }>(
    "SELECT value FROM settings WHERE key = $1",
    [logo.key]
  );
  if (existing.rows[0]?.value?.startsWith("/objects/")) {
    console.log(
      `  Already migrated (${existing.rows[0].value}) — skipping.`
    );
    return;
  }

  // Download from external source
  console.log(`  Downloading from ${logo.sourceUrl} ...`);
  const imgRes = await fetch(logo.sourceUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; logo-migrator/1.0)" },
    redirect: "follow",
  });
  if (!imgRes.ok) {
    throw new Error(`Download failed: ${imgRes.status} ${imgRes.statusText}`);
  }
  const imageBuffer = await imgRes.arrayBuffer();
  const contentType = imgRes.headers.get("content-type") || "image/png";
  console.log(`  Downloaded ${imageBuffer.byteLength} bytes (${contentType})`);

  // Step 1: request presigned upload URL (same as POST /api/storage/uploads/request-url)
  const { signedUrl, objectPath } = await requestUploadUrl();
  console.log(`  Presigned URL obtained → objectPath: ${objectPath}`);

  // Step 2: upload directly to GCS (same as client PUT to presigned URL)
  await putToSignedUrl(signedUrl, imageBuffer, contentType);
  console.log(`  Uploaded to GCS OK`);

  // Persist the internal path in the database
  if (existing.rows.length > 0) {
    await client.query(
      "UPDATE settings SET value = $1, updated_at = NOW() WHERE key = $2",
      [objectPath, logo.key]
    );
  } else {
    await client.query(
      "INSERT INTO settings (key, value) VALUES ($1, $2)",
      [logo.key, objectPath]
    );
  }

  console.log(`  DB updated: ${logo.key} = ${objectPath}`);
}

async function main(): Promise<void> {
  console.log("Co-organiser logo migration started.\n");

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    for (const logo of logos) {
      console.log(`Processing ${logo.label} ...`);
      try {
        await migrateOneLogo(client, logo);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`  ERROR: ${message}`);
        process.exitCode = 1;
      }
      console.log();
    }
  } finally {
    await client.end();
  }

  console.log("Done.");
  process.exit(process.exitCode ?? 0);
}

main();
