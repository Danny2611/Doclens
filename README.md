# DocLens

## Local infrastructure

Copy the local development defaults, then start PostgreSQL, Redis, and MinIO:

```powershell
Copy-Item .env.example .env
docker compose up -d
docker compose ps
```

The local services use named Docker volumes and retain data through a normal
`docker compose stop` followed by `docker compose start`. Do not use
`docker compose down -v` unless you intentionally want to delete local data.

| Service       | Local address           |
| ------------- | ----------------------- |
| PostgreSQL    | `localhost:5433`        |
| Redis         | `localhost:6379`        |
| MinIO API     | `http://localhost:9000` |
| MinIO Console | `http://localhost:9001` |

The credentials in `.env.example` are development-only defaults. Change them
in your ignored `.env` file when needed; never commit real credentials.

## Storage smoke test

After copying `.env.example` to `.env` and starting MinIO, run the opt-in
presigned upload smoke test:

```powershell
docker compose up -d minio minio-init
pnpm --filter @doclens/storage run test:smoke
```

The command reads `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`,
`S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE`, and
`S3_PRESIGNED_UPLOAD_EXPIRATION_SECONDS` from the ignored root `.env` file.
It creates one unique object under `smoke-tests/`, uploads a small PDF fixture
through a presigned `PUT` URL, verifies its metadata, and removes the object
in a `finally` block. It never prints the presigned URL or credentials.
