# Official Node slim (digest pinned 2026-05-23). Refresh:
#   docker pull node:24-bookworm-slim
#   docker inspect --format='{{index .RepoDigests 0}}' node:24-bookworm-slim
ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-bookworm-slim@sha256:242549cd46785b480c832479a730f4f2a20865d61ea2e404fdb2a5c3d3b73ecf

USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates git \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@11.2.2 --activate
USER node
