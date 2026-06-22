---
name: Upload error diagnosis
description: How to diagnose "Failed to get upload URL" in the SATBDS symposium platform
---

## Rule
Before assuming the ImageUploadField or storage route has a code bug, confirm the endpoint works with curl using a fresh admin token. The most common cause of this error is a transient API server restart state (e.g. after a task merge restart).

**Why:** The sidecar at `http://127.0.0.1:1106` and object storage env vars (PRIVATE_OBJECT_DIR, DEFAULT_OBJECT_STORAGE_BUCKET_ID) are all correctly set. The endpoint returns HTTP 200 with a valid signed GCS URL when the server is running cleanly.

**How to apply:**
1. Log in: `curl -s -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@satbds2027.org","password":"admin123"}'`
2. Test upload URL: `curl -s -X POST http://localhost:8080/api/storage/uploads/request-url -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"name":"test.png","size":1,"contentType":"image/png"}'`
3. If curl returns 200, restart all workflows and ask user to retry.
