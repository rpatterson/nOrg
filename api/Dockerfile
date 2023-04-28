## Use static HTTP server as a rudimentary API:

FROM nginx:perl

RUN \
    rm -f /etc/apt/apt.conf.d/docker-clean && \
    echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' \
    >"/etc/apt/apt.conf.d/keep-cache"
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install --no-install-recommends -y git=1:2.30.2-1+deb11u2 && \
    git config --system --add safe.directory "/usr/share/nginx/html"

# https://github.com/opencontainers/image-spec/blob/main/annotations.md#pre-defined-annotation-keys
LABEL org.opencontainers.image.url="https://gitlab.com/rpatterson/norg"
LABEL org.opencontainers.image.documentation="https://gitlab.com/rpatterson/norg"
LABEL org.opencontainers.image.source="https://gitlab.com/rpatterson/norg"
LABEL org.opencontainers.image.title="nOrg Minimal API"
LABEL org.opencontainers.image.description="Use static HTTP server as a rudimentary nOrg API"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.authors="Ross Patterson <me@rpatterson.net>"
LABEL org.opencontainers.image.vendor="rpatterson.net"
LABEL org.opencontainers.image.base.name="docker.io/library/nginx:perl"
