#!/bin/bash

# Dekode private key
echo "$GOOGLE_PRIVATE_KEY" | base64 -d > /tmp/service-account-key.json
export GOOGLE_PRIVATE_KEY=$(cat /tmp/service-account-key.json)

# Jalankan aplikasi
node src/app.js