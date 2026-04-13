@description('Database server location')
param location string

@description('PostgreSQL server name')
param serverName string

@description('Database Administrator User')
param dbUser string

@secure()
@description('Database administrator password')
param dbPassword string

@description('Table with the names of the databases to be created')
param databaseNames array

resource pgServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: serverName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: dbUser
    administratorLoginPassword: dbPassword
    version: '14'
    highAvailability: { mode: 'Disabled' }
    storage: { storageSizeGB: 32 }
  }
}

resource pgFirewall 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  parent: pgServer
  name: 'AllowAllAzureServicesAndResourcesWithinIG'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource dbs 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = [for dbName in databaseNames: {
  parent: pgServer
  name: dbName
}]

output fqdn string = pgServer.properties.fullyQualifiedDomainName