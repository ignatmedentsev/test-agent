ARG NODE_VERSION=18.15.0-focal

FROM nanoxmarketplace/nodejs:${NODE_VERSION} as builder
ARG GIT_COMMIT_HASH=''

ENV HOME=/var/lib/node

ARG APT_PROXY=
ARG DEBIAN_FRONTEND="noninteractive"

RUN set -eux; \
  # enable APT_PROXY if it has been specified
  if [ -n "${APT_PROXY}" ];then \
    echo "Acquire::http { Proxy \"${APT_PROXY}\"; };" > /etc/apt/apt.conf.d/01proxy; \
  fi; \
  # see note below about "*.pyc" files
  export PYTHONDONTWRITEBYTECODE=1; \
  dpkg --add-architecture i386; \
  apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF; \
  echo "deb https://download.mono-project.com/repo/ubuntu stable-$(lsb_release -cs) main" > /etc/apt/sources.list.d/mono-official-stable.list; \
  apt-get -yyq update; \
  apt-get -yyq install --no-install-recommends \
    ca-certificates-mono \
    fontconfig-config \
    fonts-dejavu-core \
    libfontconfig1 \
    libgraphite2-3 \
    libharfbuzz0b \
    libjpeg8 \
    liblcms2-2 \
    libpng16-16 \
    mono-complete \
    wine \
    wine32 \
    ; \
  apt-get clean; \
  rm -rf /var/lib/apt/lists/*; \
  # some of the steps above generate a lot of "*.pyc" files (and setting "PYTHONDONTWRITEBYTECODE" beforehand doesn't propagate properly for some reason), so we clean them up manually (as long as they aren't owned by a package)
	find /usr -name '*.pyc' -type f -exec bash -c 'for pyc; do dpkg -S "$pyc" &> /dev/null || rm -vf "$pyc"; done' -- '{}' +; \
  # disable APT_PROXY if it has been specified
  if [ -n "${APT_PROXY}" ];then \
    rm /etc/apt/apt.conf.d/01proxy; \
  fi;

RUN set -ex; \
  mkdir -p /app; \
  chown -R node:node /app; \
  mkdir -p ~node/.wine; \
  chown -R node:node ~node/.wine

USER node
WORKDIR /app

COPY --chown=node:node package.json package-lock.json /app/

RUN set -ex; \
  npm ci

COPY --chown=node:node ./ /app/

RUN set -ex; \
  sed -i -e "s/GIT_COMMIT_HASH =.*;/GIT_COMMIT_HASH = '${GIT_COMMIT_HASH}';/g" libs/agent/src/modules/agent/agent.const.ts

USER root
