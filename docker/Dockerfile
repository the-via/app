FROM oven/bun:1.3.12-alpine AS bun

FROM node:24.15.0-alpine3.22 AS npm-builder
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
RUN apk add git

ARG TAG USERNAME=node BUILD_UID=1000 BUILD_GID=1000
ARG HOMEPATH=${USERNAME:+/home/}${USERNAME:-/root}

USER ${BUILD_UID:?}:${BUILD_GID:?}
WORKDIR /build

COPY --chown=${BUILD_UID}:${BUILD_GID} package.json package-lock.json bun.lockb ./
RUN bun install

COPY --chown=${BUILD_UID}:${BUILD_GID} public public
COPY --chown=${BUILD_UID}:${BUILD_GID} scripts scripts
COPY --chown=${BUILD_UID}:${BUILD_GID} src src
COPY --chown=${BUILD_UID}:${BUILD_GID} types types
COPY --chown=${BUILD_UID}:${BUILD_GID} index.html vite.config.ts tsconfig*.json ./
RUN bun run refresh-kbs && bun run build

FROM caddy:2.11.2-alpine AS caddy
# remove cap_net_bind_service=+ep so image can be run with no-new-privileges=true
RUN --network=none setcap -r /usr/bin/caddy

FROM scratch AS via
LABEL org.opencontainers.image.description="VIA - Your keyboard's best friend"
LABEL org.opencontainers.image.documentation="https://www.caniusevia.com/docs/specification"
LABEL org.opencontainers.image.source="https://github.com/the-via/app"
LABEL org.opencontainers.image.title="VIA"
LABEL org.opencontainers.image.url="https://www.caniusevia.com/"

WORKDIR /config
COPY --from=caddy --chmod=0755 /usr/bin/caddy /usr/bin/caddy
COPY --chmod=0644 docker/Caddyfile /config/Caddyfile

ARG APP_UID=1000 APP_GID=1000
USER ${APP_UID}:${APP_GID}
WORKDIR /data

WORKDIR /app
COPY --from=npm-builder --chmod=u=rwX,go=rX /build/dist .

ENV XDG_DATA_HOME=/data XDG_CONFIG_HOME=/config

WORKDIR /config
ENTRYPOINT [ "/usr/bin/caddy", "run", "/config/Caddyfile" ]

EXPOSE 8080/tcp
