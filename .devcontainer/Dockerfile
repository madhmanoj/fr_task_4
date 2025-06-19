FROM debian:bookworm-slim

ARG user_id=1000
ARG group_id=1000
ENV SHELL=/bin/bash

# Install required packages for VSCode + general development
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libx11-dev \
    libx11-xcb-dev \
    libxkbfile-dev \
    libnotify-bin \
    libkrb5-dev \
    xdg-utils \
    libssl-dev \
    curl \
    ca-certificates \
    git-core \
    sudo \
    python3 \
    # For wasm-opt
    binaryen \
    && rm -rf /var/lib/apt/lists/*

# Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
  && apt-get install -y nodejs

ENV NODE_OPTIONS="--max-old-space-size=4096"

# Scaffolding for vscode extension
# RUN npm install -g yo generator-code

# wit2ts tool for generating typescript bindings
# RUN npm install -g @vscode/wasm-component-model


# Create a developer user
RUN groupadd --gid $group_id developer && useradd --uid $user_id --gid $group_id -m developer && \
    echo developer ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/developer && \
    chmod 0440 /etc/sudoers.d/developer

USER developer
WORKDIR /home/developer

# Install Rust, and essential WASM tools
# https://github.com/microsoft/vscode-wasm/issues/220
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y 
# --default-toolchain 1.82.0
ENV PATH=/home/developer/.cargo/bin:$PATH
# https://blog.rust-lang.org/2024/04/09/updates-to-rusts-wasi-targets/
RUN rustup target add wasm32-unknown-unknown
RUN rustup target add wasm32-wasip1
# RUN cargo install --locked wasm-tools@1.220.0
# RUN cargo install wit-bindgen-cli