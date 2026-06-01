@description('Name of the environment managed by azd')
param environmentName string

@description('Location for all resources')
param location string = resourceGroup().location

@description('Azure Container Registry name')
param acrName string

@description('Database Administrator User')
param dbUser string = 'postgres_admin'

@description('API Gateway public URL')
param baseUrl string

@secure()
param dbPassword string
@secure()
param jwtSecret string
@secure()
param itSecret string
@secure()
param passwordSalt string

param apiGatewayImageName string = ''
param authServiceImageName string = ''
param offersServiceImageName string = ''
param usersServiceImageName string = ''
param depositServiceImageName string = ''
param notificationServiceImageName string = ''
param gqlGatewayImageName string = ''
param monitorServiceImageName string = ''

var helloWorldImage = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
var uniqueSuffix = uniqueString(resourceGroup().id)

resource acr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: acrName
  location: location
  sku: { name: 'Basic' }
  properties: { adminUserEnabled: true }
}

module env 'env.bicep' = {
  name: 'env-deployment'
  params: {
    location: location
    envName: 'cae-${environmentName}'
    logAnalyticsWorkspaceName: 'law-${environmentName}'
  }
}

module db 'db.bicep' = {
  name: 'db-deployment'
  params: {
    location: location
    serverName: 'psql-${environmentName}-${uniqueSuffix}'
    dbUser: dbUser
    dbPassword: dbPassword
    databaseNames: ['users_db', 'offers_db', 'deposit_db', 'auth_db']
  }
}

module eventhubs 'eventhubs.bicep' = {
  name: 'eventhubs-deployment'
  params: {
    location: location
    namespaceName: 'evh-${environmentName}-${uniqueSuffix}'
  }
}

module redis 'redis.bicep' = {
  name: 'redis-deployment'
  params: {
    location: location
    redisName: 'redis-${environmentName}-${uniqueSuffix}'
  }
}

module cassandra 'cassandra.bicep' = {
  name: 'cassandra-deployment'
  params: {
    location: location
    accountName: 'cosmos-${environmentName}-${uniqueSuffix}'
  }
}

module storage 'storage.bicep' = {
  name: 'storage-deployment'
  params: {
    location: location
    storageAccountName: 'st${replace(environmentName, '-', '')}${uniqueSuffix}'
  }
}

module offersApp 'app.bicep' = {
  name: 'offers-app-deployment'
  params: {
    appName: 'offers-service'
    azdServiceName: 'offers-service'
    location: location
    environmentId: env.outputs.id
    containerImage: !empty(offersServiceImageName) ? offersServiceImageName : helloWorldImage
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    appSecrets: [
      { name: 'db-password', value: dbPassword }
      { name: 'kafka-conn', value: eventhubs.outputs.eventHubConnectionString }
    ]
    envVars: [
      { name: 'SPRING_DATASOURCE_URL', value: 'jdbc:postgresql://${db.outputs.fqdn}:5432/offers_db?sslmode=require' }
      { name: 'SPRING_DATASOURCE_USERNAME', value: dbUser }
      { name: 'SPRING_DATASOURCE_PASSWORD', secretRef: 'db-password' }
      { name: 'SPRING_KAFKA_BOOTSTRAP_SERVERS', value: eventhubs.outputs.eventHubFqdn }
      { name: 'SPRING_KAFKA_PROPERTIES_SASL_JAAS_CONFIG', secretRef: 'kafka-conn' }
    ]
  }
}

module usersApp 'app.bicep' = {
  name: 'users-app-deployment'
  params: {
    appName: 'users-service'
    azdServiceName: 'users-service'
    location: location
    environmentId: env.outputs.id
    containerImage: !empty(usersServiceImageName) ? usersServiceImageName : helloWorldImage
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    appSecrets: [
      { name: 'jwt-secret', value: jwtSecret }
      { name: 'db-password', value: dbPassword }
      { name: 'storage-conn', value: storage.outputs.connectionString }
    ]
    envVars: [
      { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
      { name: 'SPRING_DATASOURCE_URL', value: 'jdbc:postgresql://${db.outputs.fqdn}:5432/users_db?sslmode=require' }
      { name: 'SPRING_DATASOURCE_USERNAME', value: dbUser }
      { name: 'SPRING_DATASOURCE_PASSWORD', secretRef: 'db-password' }
      { name: 'AZURE_STORAGE_CONNECTION_STRING', secretRef: 'storage-conn' }
    ]
  }
}

module gqlGatewayApp 'app.bicep' = {
  name: 'gql-gateway-deployment'
  params: {
    appName: 'gql-gateway'
    azdServiceName: 'gql-gateway'
    location: location
    environmentId: env.outputs.id
    containerImage: !empty(gqlGatewayImageName) ? gqlGatewayImageName : helloWorldImage
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    appSecrets: [
      { name: 'jwt-secret', value: jwtSecret }
      { name: 'redis-password', value: redis.outputs.primaryKey }
    ]
    envVars: [
      { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
      { name: 'SPRING_DATA_REDIS_HOST', value: redis.outputs.hostName }
      { name: 'SPRING_DATA_REDIS_PORT', value: string(redis.outputs.sslPort) }
      { name: 'SPRING_DATA_REDIS_PASSWORD', secretRef: 'redis-password' }
      { name: 'SPRING_DATA_REDIS_SSL', value: 'true' }
    ]
  }
}

module monitorApp 'app.bicep' = {
  name: 'monitor-service-deployment'
  params: {
    appName: 'monitor-service'
    azdServiceName: 'monitor-service'
    location: location
    environmentId: env.outputs.id
    containerImage: !empty(monitorServiceImageName) ? monitorServiceImageName : helloWorldImage
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    appSecrets: [
      { name: 'cassandra-password', value: cassandra.outputs.password }
      { name: 'kafka-conn', value: eventhubs.outputs.eventHubConnectionString }
    ]
    envVars: [
      { name: 'SPRING_CASSANDRA_CONTACT_POINTS', value: cassandra.outputs.contactPoint }
      { name: 'SPRING_CASSANDRA_PORT', value: cassandra.outputs.port }
      { name: 'SPRING_CASSANDRA_USERNAME', value: cassandra.outputs.username }
      { name: 'SPRING_CASSANDRA_PASSWORD', secretRef: 'cassandra-password' }
      { name: 'SPRING_CASSANDRA_SSL', value: 'true' }
      { name: 'SPRING_KAFKA_BOOTSTRAP_SERVERS', value: eventhubs.outputs.eventHubFqdn }
      { name: 'SPRING_KAFKA_PROPERTIES_SASL_JAAS_CONFIG', secretRef: 'kafka-conn' }
    ]
  }
}

module apiGatewayApp 'app.bicep' = {
  name: 'api-gateway-deployment'
  params: {
    appName: 'api-gateway'
    azdServiceName: 'api-gateway'
    location: location
    environmentId: env.outputs.id
    containerImage: !empty(apiGatewayImageName) ? apiGatewayImageName : helloWorldImage
    isExternalIngress: true // Tylko Gateway jest widoczny w internecie
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    appSecrets: [
      { name: 'jwt-secret', value: jwtSecret }
    ]
    envVars: [
      { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
      { name: 'GATEWAY_ROUTES_0_ID', value: 'users' }
      { name: 'GATEWAY_ROUTES_0_URI', value: 'http://${usersApp.outputs.fqdn}' }
      { name: 'GATEWAY_ROUTES_1_ID', value: 'offers' }
      { name: 'GATEWAY_ROUTES_1_URI', value: 'http://${offersApp.outputs.fqdn}' }
      { name: 'GATEWAY_ROUTES_GQL_ID', value: 'graphql' }
      { name: 'GATEWAY_ROUTES_GQL_URI', value: 'http://${gqlGatewayApp.outputs.fqdn}' }
    ]
  }
}

output apiGatewayUrl string = apiGatewayApp.outputs.fqdn