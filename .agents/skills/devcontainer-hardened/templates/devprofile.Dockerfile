# NODE_MAJOR: resolve at apply time (SKILL.md Step 1). LTS major when pinned: 24.
# Pin digest before committing:
#   docker pull node:${NODE_VERSION}-bookworm-slim
#   docker inspect --format='{{index .RepoDigests 0}}' node:${NODE_VERSION}-bookworm-slim
ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-bookworm-slim@sha256:242549cd46785b480c832479a730f4f2a20865d61ea2e404fdb2a5c3d3b73ecf

# git: some lockfile deps resolve via git; ca-certificates: HTTPS for registry
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates git \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@11.2.2 --activate
USER node
