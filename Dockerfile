FROM mcr.microsoft.com/devcontainers/typescript-node:20

# optional extra tools
RUN npm install -g ts-node nodemon

WORKDIR /workspace