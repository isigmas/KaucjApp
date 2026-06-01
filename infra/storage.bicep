param location string
param storageAccountName string

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: { supportsHttpsTrafficOnly: true }
}

output connectionString string = 'DefaultEndpointsProtocol=https;
AccountName=${storageAccount.name};
AccountKey=${storageAccount.listKeys().keys[0].value};
EndpointSuffix=core.windows.net'