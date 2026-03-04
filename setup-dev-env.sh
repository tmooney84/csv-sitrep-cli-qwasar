#!/usr/bin/env bash

set -e  # Exit immediately if a command exits with a non-zero status

echo "Updating system..."
sudo apt update && sudo apt upgrade -y

echo "Installing curl if missing..."
sudo apt install -y curl build-essential

echo "Installing Node.js (LTS) from NodeSource..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

#add error logic?
echo "Verifying Node installation..."
node -v
npm -v

#echo "Creating project directory (if not exists)..."
#PROJECT_DIR="csv-sitrep"
#mkdir -p $PROJECT_DIR
#cd $PROJECT_DIR

if [ ! -f package.json ]; then
  echo "Initializing npm project..."
  npm init -y
fi

echo "Installing dependencies..."
npm install csv-parser

echo "Installing dev dependencies..."
npm install --save-dev typescript ts-node @types/node

echo "Initializing TypeScript configuration..."
if [ ! -f tsconfig.json ]; then
  npx tsc --init
  # Optional: This line automatically adds "type": "module" to your package.json
  npm pkg set type="module"
fi

echo "Setup complete!"
echo ""
echo "To run TypeScript directly:"
echo "  npx ts-node index.ts"
echo ""
echo "To compile:"
echo "  npx tsc"
