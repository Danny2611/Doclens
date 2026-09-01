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

| Service | Local address |
| --- | --- |
| PostgreSQL | `localhost:5433` |
| Redis | `localhost:6379` |
| MinIO API | `http://localhost:9000` |
| MinIO Console | `http://localhost:9001` |

The credentials in `.env.example` are development-only defaults. Change them
in your ignored `.env` file when needed; never commit real credentials.
