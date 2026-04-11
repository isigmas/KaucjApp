#!/bin/bash

set -a
source .env
set +a

az deployment group create \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --template-file main.bicep \
  --parameters \
      acrName="$AZURE_CONTAINER_REGISTRY" \
      dbUser="$DB_USER" \
      dbPassword="$DB_PASSWORD" \
      itSecret="$IT_SECRET" \
      jwtSecret="$JWT_SECRET" \
      passwordSalt="$PASSWORD_SALT"