param location string
param redisName string

resource redisCache 'Microsoft.Cache/Redis@2023-08-01' = {
  name: redisName
  location: location
  properties: {
    sku: {
      name: 'Basic'
      family: 'C'
      capacity: 0
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
  }
}

output hostName string = redisCache.properties.hostName
output sslPort int = redisCache.properties.sslPort
output primaryKey string = redisCache.listKeys().primaryKey
