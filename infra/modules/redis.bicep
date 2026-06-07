// Azure Cache for Redis is retired; use Azure Managed Redis (redisEnterprise).
param location string
param redisName string

resource redis 'Microsoft.Cache/redisEnterprise@2025-04-01' = {
  name: redisName
  location: location
  sku: {
    name: 'Balanced_B0'
  }
  properties: {
    minimumTlsVersion: '1.2'
    highAvailability: 'Disabled'
  }
}

resource redisDatabase 'Microsoft.Cache/redisEnterprise/databases@2025-04-01' = {
  parent: redis
  name: 'default'
  properties: {
    clientProtocol: 'Encrypted'
    clusteringPolicy: 'OSSCluster'
    evictionPolicy: 'AllKeysLRU'
  }
}

output hostName string = redis.properties.hostName
output sslPort int = redisDatabase.properties.port
@secure()
output primaryKey string = redisDatabase.listKeys().primaryKey
