# syntax=docker/dockerfile:1
# Backend (Deno). Build context = backend/.
FROM denoland/deno:alpine-2.9.5
WORKDIR /app
COPY deno.json ./
COPY src ./src
# Pre-fetch + type-check dependencies at build time so cold starts are fast and offline-safe.
RUN deno cache src/main.ts && chown -R deno:deno /deno-dir /app
USER deno
EXPOSE 8080
ENV PORT=8080
# Permissions are deliberately narrow. /cloudsql is where Cloud Run mounts the Cloud SQL unix socket;
# Deno requires read+write on a socket path to connect to it.
CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read=/app,/cloudsql", "--allow-write=/cloudsql", "src/main.ts"]
