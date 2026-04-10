#!/bin/bash

set -a
source .env
set +a

az group delete \
  --name "$AZURE_RESOURCE_GROUP" \
  --yes \
  --no-wait