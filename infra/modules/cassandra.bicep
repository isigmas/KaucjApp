param location string
param accountName string
param keyspaceName string = 'monitor_db'

resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts@2023-11-15' = {
  name: accountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    capabilities: [ { name: 'EnableCassandra' } ]
    databaseAccountOfferType: 'Standard'
    locations: [ { locationName: location, failoverPriority: 0, isZoneRedundant: false } ]
  }
}

resource cassandraKeyspace 'Microsoft.DocumentDB/databaseAccounts/cassandraKeyspaces@2023-11-15' = {
  parent: cosmosDb
  name: keyspaceName
  properties: {
    resource: { id: keyspaceName }
    options: { throughput: 400 }
  }
}

output contactPoint string = '${cosmosDb.name}.cassandra.cosmos.azure.com'
output port string = '10350'
output username string = cosmosDb.name
output password string = cosmosDb.listKeys().primaryMasterKey
