@description('Name of the environment managed by azd')
param environmentName string

@description('Location for all resources')
param location string = resourceGroup().location

@description('Azure Container Registry name')
param acrName string

@description('Database Administrator User')
param dbUser string = 'postgres_admin'

@description('Public URL of the GraphQL gateway, used for links in e-mails')
param baseUrl string

@secure()
@description('Database password')
param dbPassword string
@secure()
@description('JWT signing secret')
param jwtSecret string
@secure()
@description('Internal service-to-service token')
param itSecret string
@secure()
@description('Password salt used by auth-service')
param passwordSalt string
@secure()
@description('Resend SMTP API key (spring.mail.password)')
param mailPassword string
@secure()
@description('Bootstrap admin username')
param adminUsername string
@secure()
@description('Bootstrap admin e-mail')
param adminEmail string
@secure()
@description('Bootstrap admin password')
param adminPassword string

param authServiceImageName string = ''
param offersServiceImageName string = ''
param usersServiceImageName string = ''
param depositServiceImageName string = ''
param notificationServiceImageName string = ''
param gqlGatewayImageName string = ''
param monitorServiceImageName string = ''

var helloWorldImage = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
var uniqueSuffix = uniqueString(resourceGroup().id)

var kafkaJaasConfig = 'org.apache.kafka.common.security.plain.PlainLoginModule required username="$ConnectionString" password="${eventhubs.outputs.connectionString}";'

resource acr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: acrName
  location: location
  sku: { name: 'Basic' }
  properties: { adminUserEnabled: true }
}

module env 'modules/env.bicep' = {
  name: 'env-deployment'
  params: {
    location: location
    envName: 'cae-${environmentName}'
    logAnalyticsWorkspaceName: 'law-${environmentName}'
  }
}

module db 'modules/db.bicep' = {
  name: 'db-deployment'
  params: {
    location: location
    serverName: 'psql-${environmentName}-${uniqueSuffix}'
    dbUser: dbUser
    dbPassword: dbPassword
    databaseNames: ['users_db', 'offers_db', 'deposit_db', 'auth_db', 'notification_db']
  }
}

module eventhubs 'modules/eventhubs.bicep' = {
  name: 'eventhubs-deployment'
  params: {
    location: location
    namespaceName: 'evh-${environmentName}-${uniqueSuffix}'
  }
}

module redis 'modules/redis.bicep' = {
  name: 'redis-deployment'
  params: {
    location: location
    redisName: 'amr-${environmentName}-${uniqueSuffix}'
  }
}

module cassandra 'modules/cassandra.bicep' = {
  name: 'cassandra-deployment'
  params: {
    location: location
    accountName: 'cosmos-${environmentName}-${uniqueSuffix}'
  }
}

module storage 'modules/storage.bicep' = {
  name: 'storage-deployment'
  params: {
    location: location
    storageAccountName: 'st${replace(environmentName, '-', '')}${uniqueSuffix}'
  }
}

module offersApp 'modules/app.bicep' = {
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
    minReplicas: 1
    maxReplicas: 1
    appSecrets: [
      { name: 'db-password', value: dbPassword }
      { name: 'kafka-jaas', value: kafkaJaasConfig }
    ]
    envVars: [
      { name: 'SERVER_PORT', value: '8080' }
      { name: 'SPRING_DATASOURCE_URL', value: 'jdbc:postgresql://${db.outputs.fqdn}:5432/offers_db?sslmode=require' }
      { name: 'SPRING_DATASOURCE_USERNAME', value: dbUser }
      { name: 'SPRING_DATASOURCE_PASSWORD', secretRef: 'db-password' }
      { name: 'SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE', value: '2' }
      { name: 'SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE', value: '1' }
      { name: 'SPRING_JPA_HIBERNATE_DDL_AUTO', value: 'update' }
      { name: 'SPRING_KAFKA_BOOTSTRAP_SERVERS', value: eventhubs.outputs.fqdn }
      { name: 'SPRING_KAFKA_PROPERTIES_SECURITY_PROTOCOL', value: 'SASL_SSL' }
      { name: 'SPRING_KAFKA_PROPERTIES_SASL_MECHANISM', value: 'PLAIN' }
      { name: 'SPRING_KAFKA_PROPERTIES_SASL_JAAS_CONFIG', secretRef: 'kafka-jaas' }
    ]
  }
}

module usersApp 'modules/app.bicep' = {
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
    minReplicas: 1
    maxReplicas: 3
    appSecrets: [
      { name: 'it-secret', value: itSecret }
      { name: 'db-password', value: dbPassword }
      { name: 'storage-conn', value: storage.outputs.connectionString }
      { name: 'kafka-jaas', value: kafkaJaasConfig }
    ]
    envVars: [
      { name: 'SERVER_PORT', value: '8080' }
      { name: 'IT_SECRET', secretRef: 'it-secret' }
      { name: 'SPRING_DATASOURCE_URL', value: 'jdbc:postgresql://${db.outputs.fqdn}:5432/users_db?sslmode=require' }
      { name: 'SPRING_DATASOURCE_USERNAME', value: dbUser }
      { name: 'SPRING_DATASOURCE_PASSWORD', secretRef: 'db-password' }
      { name: 'SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE', value: '2' }
      { name: 'SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE', value: '1' }
      { name: 'SPRING_JPA_HIBERNATE_DDL_AUTO', value: 'update' }
      { name: 'AZURE_STORAGE_USE_DEVELOPMENT_STORAGE', value: 'false' }
      { name: 'AZURE_STORAGE_CONNECTION_STRING', secretRef: 'storage-conn' }
      { name: 'AZURE_STORAGE_PUBLIC_BLOB_ENDPOINT', value: storage.outputs.blobEndpoint }
      { name: 'AZURE_STORAGE_CONTAINER_NAME', value: 'profile-pictures' }
      { name: 'AZURE_STORAGE_PUBLIC_READ_ACCESS', value: 'true' }
      { name: 'SPRING_KAFKA_BOOTSTRAP_SERVERS', value: eventhubs.outputs.fqdn }
      { name: 'SPRING_KAFKA_PROPERTIES_SECURITY_PROTOCOL', value: 'SASL_SSL' }
      { name: 'SPRING_KAFKA_PROPERTIES_SASL_MECHANISM', value: 'PLAIN' }
      { name: 'SPRING_KAFKA_PROPERTIES_SASL_JAAS_CONFIG', secretRef: 'kafka-jaas' }
    ]
  }
}

module authApp 'modules/app.bicep' = {
  name: 'auth-app-deployment'
  params: {
    appName: 'auth-service'
    azdServiceName: 'auth-service'
    location: location
    environmentId: env.outputs.id
    containerImage: !empty(authServiceImageName) ? authServiceImageName : helloWorldImage
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    minReplicas: 1
    maxReplicas: 3
    appSecrets: [
      { name: 'db-password', value: dbPassword }
      { name: 'jwt-secret', value: jwtSecret }
      { name: 'it-secret', value: itSecret }
      { name: 'password-salt', value: passwordSalt }
      { name: 'admin-username', value: adminUsername }
      { name: 'admin-email', value: adminEmail }
      { name: 'admin-password', value: adminPassword }
      { name: 'kafka-jaas', value: kafkaJaasConfig }
    ]
    envVars: [
      { name: 'SERVER_PORT', value: '8080' }
      { name: 'SPRING_DATASOURCE_URL', value: 'jdbc:postgresql://${db.outputs.fqdn}:5432/auth_db?sslmode=require' }
      { name: 'SPRING_DATASOURCE_USERNAME', value: dbUser }
      { name: 'SPRING_DATASOURCE_PASSWORD', secretRef: 'db-password' }
      { name: 'SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE', value: '2' }
      { name: 'SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE', value: '1' }
      { name: 'SPRING_JPA_HIBERNATE_DDL_AUTO', value: 'update' }
      { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
      { name: 'IT_SECRET', secretRef: 'it-secret' }
      { name: 'PASSWORD_SALT', secretRef: 'password-salt' }
      { name: 'ADMIN_USERNAME', secretRef: 'admin-username' }
      { name: 'ADMIN_EMAIL', secretRef: 'admin-email' }
      { name: 'ADMIN_PASSWORD', secretRef: 'admin-password' }
      { name: 'SPRING_KAFKA_BOOTSTRAP_SERVERS', value: eventhubs.outputs.fqdn }
      { name: 'SPRING_KAFKA_PROPERTIES_SECURITY_PROTOCOL', value: 'SASL_SSL' }
      { name: 'SPRING_KAFKA_PROPERTIES_SASL_MECHANISM', value: 'PLAIN' }
      { name: 'SPRING_KAFKA_PROPERTIES_SASL_JAAS_CONFIG', secretRef: 'kafka-jaas' }
    ]
  }
}

module depositApp 'modules/app.bicep' = {
  name: 'deposit-app-deployment'
  params: {
    appName: 'deposit-service'
    azdServiceName: 'deposit-service'
    location: location
    environmentId: env.outputs.id
    containerImage: !empty(depositServiceImageName) ? depositServiceImageName : helloWorldImage
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    minReplicas: 1
    maxReplicas: 3
    appSecrets: [
      { name: 'db-password', value: dbPassword }
      { name: 'kafka-jaas', value: kafkaJaasConfig }
    ]
    envVars: [
      { name: 'SERVER_PORT', value: '8080' }
      { name: 'SPRING_DATASOURCE_URL', value: 'jdbc:postgresql://${db.outputs.fqdn}:5432/deposit_db?sslmode=require' }
      { name: 'SPRING_DATASOURCE_USERNAME', value: dbUser }
      { name: 'SPRING_DATASOURCE_PASSWORD', secretRef: 'db-password' }
      { name: 'SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE', value: '2' }
      { name: 'SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE', value: '1' }
      { name: 'SPRING_JPA_HIBERNATE_DDL_AUTO', value: 'update' }
      { name: 'SPRING_KAFKA_BOOTSTRAP_SERVERS', value: eventhubs.outputs.fqdn }
      { name: 'SPRING_KAFKA_PROPERTIES_SECURITY_PROTOCOL', value: 'SASL_SSL' }
      { name: 'SPRING_KAFKA_PROPERTIES_SASL_MECHANISM', value: 'PLAIN' }
      { name: 'SPRING_KAFKA_PROPERTIES_SASL_JAAS_CONFIG', secretRef: 'kafka-jaas' }
    ]
  }
}

module notificationApp 'modules/app.bicep' = {
  name: 'notification-app-deployment'
  params: {
    appName: 'notification-service'
    azdServiceName: 'notification-service'
    location: location
    environmentId: env.outputs.id
    containerImage: !empty(notificationServiceImageName) ? notificationServiceImageName : helloWorldImage
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    minReplicas: 1
    maxReplicas: 1
    appSecrets: [
      { name: 'db-password', value: dbPassword }
      { name: 'mail-password', value: mailPassword }
      { name: 'kafka-jaas', value: kafkaJaasConfig }
    ]
    envVars: [
      { name: 'SERVER_PORT', value: '8080' }
      { name: 'BASE_URL', value: baseUrl }
      { name: 'MAIL_PASSWORD', secretRef: 'mail-password' }
      { name: 'SPRING_DATASOURCE_URL', value: 'jdbc:postgresql://${db.outputs.fqdn}:5432/notification_db?sslmode=require' }
      { name: 'SPRING_DATASOURCE_USERNAME', value: dbUser }
      { name: 'SPRING_DATASOURCE_PASSWORD', secretRef: 'db-password' }
      { name: 'SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE', value: '2' }
      { name: 'SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE', value: '1' }
      { name: 'SPRING_JPA_HIBERNATE_DDL_AUTO', value: 'update' }
      { name: 'SPRING_KAFKA_BOOTSTRAP_SERVERS', value: eventhubs.outputs.fqdn }
      { name: 'SPRING_KAFKA_PROPERTIES_SECURITY_PROTOCOL', value: 'SASL_SSL' }
      { name: 'SPRING_KAFKA_PROPERTIES_SASL_MECHANISM', value: 'PLAIN' }
      { name: 'SPRING_KAFKA_PROPERTIES_SASL_JAAS_CONFIG', secretRef: 'kafka-jaas' }
    ]
  }
}

module monitorApp 'modules/app.bicep' = {
  name: 'monitor-app-deployment'
  params: {
    appName: 'monitor-service'
    azdServiceName: 'monitor-service'
    location: location
    environmentId: env.outputs.id
    containerImage: !empty(monitorServiceImageName) ? monitorServiceImageName : helloWorldImage
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    minReplicas: 1
    maxReplicas: 1
    appSecrets: [
      { name: 'cassandra-password', value: cassandra.outputs.password }
      { name: 'kafka-jaas', value: kafkaJaasConfig }
    ]
    envVars: [
      { name: 'SERVER_HOST', value: '0.0.0.0' }
      { name: 'SERVER_PORT', value: '8080' }
      { name: 'KAFKA_SERVERS', value: eventhubs.outputs.fqdn }
      { name: 'KAFKA_SECURITY_PROTOCOL', value: 'SASL_SSL' }
      { name: 'KAFKA_SASL_MECHANISM', value: 'PLAIN' }
      { name: 'KAFKA_SASL_JAAS_CONFIG', secretRef: 'kafka-jaas' }
      { name: 'CASSANDRA_CONTACT_POINTS', value: '${cassandra.outputs.contactPoint}:${cassandra.outputs.port}' }
      { name: 'CASSANDRA_DATACENTER', value: 'datacenter1' }
      { name: 'CASSANDRA_USERNAME', value: cassandra.outputs.username }
      { name: 'CASSANDRA_PASSWORD', secretRef: 'cassandra-password' }
      { name: 'CASSANDRA_SSL_ENGINE_FACTORY_CLASS', value: 'com.datastax.oss.driver.internal.core.ssl.DefaultSslEngineFactory' }
      { name: 'CASSANDRA_AUTH_PROVIDER_CLASS', value: 'com.datastax.oss.driver.api.core.auth.PlainTextAuthProvider' }
    ]
  }
}

module gqlGatewayApp 'modules/app.bicep' = {
  name: 'gql-gateway-deployment'
  params: {
    appName: 'gql-gateway'
    azdServiceName: 'gql-gateway'
    location: location
    environmentId: env.outputs.id
    containerImage: !empty(gqlGatewayImageName) ? gqlGatewayImageName : helloWorldImage
    isExternalIngress: true // gql-gateway is the only public entry point (api-gateway is not used in prod)
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    minReplicas: 1
    maxReplicas: 3
    appSecrets: [
      { name: 'jwt-secret', value: jwtSecret }
      { name: 'redis-password', value: redis.outputs.primaryKey }
    ]
    envVars: [
      { name: 'SERVER_PORT', value: '8080' }
      { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
      { name: 'SPRING_DATA_REDIS_HOST', value: redis.outputs.hostName }
      { name: 'SPRING_DATA_REDIS_PORT', value: string(redis.outputs.sslPort) }
      { name: 'SPRING_DATA_REDIS_PASSWORD', secretRef: 'redis-password' }
      { name: 'SPRING_DATA_REDIS_SSL_ENABLED', value: 'true' }
      { name: 'GATEWAY_ROUTES_0_ID', value: 'users-service' }
      { name: 'GATEWAY_ROUTES_0_PATH', value: '/api/user/**' }
      { name: 'GATEWAY_ROUTES_0_URI', value: 'http://${usersApp.outputs.fqdn}' }
      { name: 'GATEWAY_ROUTES_1_ID', value: 'offers-service' }
      { name: 'GATEWAY_ROUTES_1_PATH', value: '/api/offer/**' }
      { name: 'GATEWAY_ROUTES_1_URI', value: 'http://${offersApp.outputs.fqdn}' }
      { name: 'GATEWAY_ROUTES_2_ID', value: 'auth-service' }
      { name: 'GATEWAY_ROUTES_2_PATH', value: '/api/auth/**' }
      { name: 'GATEWAY_ROUTES_2_URI', value: 'http://${authApp.outputs.fqdn}' }
      { name: 'GATEWAY_ROUTES_3_ID', value: 'deposit-service' }
      { name: 'GATEWAY_ROUTES_3_PATH', value: '/api/deposit/**' }
      { name: 'GATEWAY_ROUTES_3_URI', value: 'http://${depositApp.outputs.fqdn}' }
      { name: 'GATEWAY_ROUTES_4_ID', value: 'notification-service' }
      { name: 'GATEWAY_ROUTES_4_PATH', value: '/api/notification/**' }
      { name: 'GATEWAY_ROUTES_4_URI', value: 'http://${notificationApp.outputs.fqdn}' }
      { name: 'GATEWAY_ROUTES_5_ID', value: 'monitor-service' }
      { name: 'GATEWAY_ROUTES_5_PATH', value: '/api/monitor/**' }
      { name: 'GATEWAY_ROUTES_5_URI', value: 'http://${monitorApp.outputs.fqdn}' }
    ]
  }
}

output gqlGatewayUrl string = 'https://${gqlGatewayApp.outputs.fqdn}'
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = acr.properties.loginServer
