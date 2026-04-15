@description('Name of the environment managed by azd')
param environmentName string

@description('Location for all resources')
param location string = resourceGroup().location

@description('Azure Container Registry name (without .azurecr.io)')
param acrName string

@description('Database Administrator User')
param dbUser string = 'postgres_admin'

@description('API Gateway public URL')
param baseUrl string

@description('Email address used for sending notifications')
param mailUsername string

@secure()
@description('Database password')
param dbPassword string

@secure()
@description('Internal Token secret')
param itSecret string

@secure()
@description('JWT Secret')
param jwtSecret string

@secure()
@description('Password Salt')
param passwordSalt string

@secure()
@description('Email password')
param mailPassword string

param apiGatewayImageName string = ''
param authServiceImageName string = ''
param offersServiceImageName string = ''
param usersServiceImageName string = ''
param depositServiceImageName string = ''
param notificationServiceImageName string = ''

var helloWorldImage = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

resource acr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

module acaEnv 'modules/env.bicep' = {
  name: 'env-deployment'
  params: {
    location: location
    envName: '${environmentName}-microservices-env'
    logAnalyticsWorkspaceName: '${environmentName}-logs-${uniqueString(resourceGroup().id)}'
  }
}

module db 'modules/db.bicep' = {
  name: 'db-deployment'
  params: {
    location: location
    serverName: '${environmentName}-psql-${uniqueString(resourceGroup().id)}'
    dbUser: dbUser
    dbPassword: dbPassword
    databaseNames: [
      'offers_db'
      'users_db'
      'auth_db'
      'deposit_db'
    ]
  }
}

module offersApp 'modules/app.bicep' = {
  name: 'offers-service-deployment'
  params: {
    appName: 'offers-service'
    azdServiceName: 'offers-service'
    location: location
    environmentId: acaEnv.outputs.id
    containerImage: !empty(offersServiceImageName) ? offersServiceImageName : helloWorldImage
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    appSecrets: [
      { name: 'db-password', value: dbPassword }
    ]
    envVars: [
      { name: 'SPRING_DATASOURCE_URL', value: 'jdbc:postgresql://${db.outputs.fqdn}:5432/offers_db?sslmode=require' }
      { name: 'SPRING_DATASOURCE_USERNAME', value: dbUser }
      { name: 'SPRING_DATASOURCE_PASSWORD', secretRef: 'db-password' }
      { name: 'SPRING_JPA_HIBERNATE_DDL_AUTO', value: 'update' }
    ]
  }
}

module usersApp 'modules/app.bicep' = {
  name: 'users-service-deployment'
  params: {
    appName: 'users-service'
    azdServiceName: 'users-service'
    location: location
    environmentId: acaEnv.outputs.id
    containerImage: !empty(usersServiceImageName) ? usersServiceImageName : helloWorldImage
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    appSecrets: [
      { name: 'db-password', value: dbPassword }
      { name: 'it-secret', value: itSecret }
    ]
    envVars: [
      { name: 'IT_SECRET', secretRef: 'it-secret' }
      { name: 'SPRING_DATASOURCE_URL', value: 'jdbc:postgresql://${db.outputs.fqdn}:5432/users_db?sslmode=require' }
      { name: 'SPRING_DATASOURCE_USERNAME', value: dbUser }
      { name: 'SPRING_DATASOURCE_PASSWORD', secretRef: 'db-password' }
      { name: 'SPRING_JPA_HIBERNATE_DDL_AUTO', value: 'update' }
    ]
  }
}

module authApp 'modules/app.bicep' = {
  name: 'auth-service-deployment'
  params: {
    appName: 'auth-service'
    azdServiceName: 'auth-service'
    location: location
    environmentId: acaEnv.outputs.id
    containerImage: !empty(authServiceImageName) ? authServiceImageName : helloWorldImage
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    appSecrets: [
      { name: 'db-password', value: dbPassword }
      { name: 'it-secret', value: itSecret }
      { name: 'jwt-secret', value: jwtSecret }
      { name: 'password-salt', value: passwordSalt }
    ]
    envVars: [
      { name: 'SPRING_DATASOURCE_URL', value: 'jdbc:postgresql://${db.outputs.fqdn}:5432/auth_db?sslmode=require' }
      { name: 'SPRING_DATASOURCE_USERNAME', value: dbUser }
      { name: 'SPRING_DATASOURCE_PASSWORD', secretRef: 'db-password' }
      { name: 'SPRING_JPA_HIBERNATE_DDL_AUTO', value: 'update' }
      { name: 'IT_SECRET', secretRef: 'it-secret' }
      { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
      { name: 'PASSWORD_SALT', secretRef: 'password-salt' }
      { name: 'USER_SERVICE_URL', value: 'http://${usersApp.outputs.fqdn}' }
      { name: 'NOTIFICATION_SERVICE_URL', value: 'http://${notificationApp.outputs.fqdn}' }
    ]
  }
}

module depositApp 'modules/app.bicep' = {
  name: 'deposit-service-deployment'
  params: {
    appName: 'deposit-service'
    azdServiceName: 'deposit-service'
    location: location
    environmentId: acaEnv.outputs.id
    containerImage: !empty(depositServiceImageName) ? depositServiceImageName : helloWorldImage
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    appSecrets: [
      { name: 'db-password', value: dbPassword }
    ]
    envVars: [
      { name: 'SPRING_DATASOURCE_URL', value: 'jdbc:postgresql://${db.outputs.fqdn}:5432/deposit_db?sslmode=require' }
      { name: 'SPRING_DATASOURCE_USERNAME', value: dbUser }
      { name: 'SPRING_DATASOURCE_PASSWORD', secretRef: 'db-password' }
      { name: 'SPRING_JPA_HIBERNATE_DDL_AUTO', value: 'update' }
    ]
  }
}

module notificationApp 'modules/app.bicep' = {
  name: 'notification-service-deployment'
  params: {
    appName: 'notification-service'
    azdServiceName: 'notification-service'
    location: location
    environmentId: acaEnv.outputs.id
    containerImage: !empty(notificationServiceImageName) ? notificationServiceImageName : helloWorldImage
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    appSecrets: [
      { name: 'mail-password', value: mailPassword }
    ]
    envVars: [
      { name: 'BASE_URL', value: baseUrl }
      { name: 'MAIL_USERNAME', value: mailUsername }
      { name: 'MAIL_PASSWORD', secretRef: 'mail-password' }
    ]
  }
}

module apiGateway 'modules/app.bicep' = {
  name: 'api-gateway-deployment'
  params: {
    appName: 'api-gateway'
    azdServiceName: 'api-gateway'
    location: location
    environmentId: acaEnv.outputs.id
    containerImage: !empty(apiGatewayImageName) ? apiGatewayImageName : helloWorldImage
    isExternalIngress: true
    acrServer: acr.properties.loginServer
    acrUsername: acr.name
    acrPassword: acr.listCredentials().passwords[0].value
    appSecrets: [
      { name: 'jwt-secret', value: jwtSecret }
    ]
    envVars: [
      { name: 'JWT_SECRET', secretRef: 'jwt-secret' }

      { name: 'GATEWAY_ROUTES_0_ID', value: 'users' }
      { name: 'GATEWAY_ROUTES_0_PATH', value: '/api/user/**' }
      { name: 'GATEWAY_ROUTES_0_URI', value: 'http://${usersApp.outputs.fqdn}' }

      { name: 'GATEWAY_ROUTES_1_ID', value: 'offers' }
      { name: 'GATEWAY_ROUTES_1_PATH', value: '/api/offer/**' }
      { name: 'GATEWAY_ROUTES_1_URI', value: 'http://${offersApp.outputs.fqdn}' }

      { name: 'GATEWAY_ROUTES_2_ID', value: 'auth' }
      { name: 'GATEWAY_ROUTES_2_PATH', value: '/api/auth/**' }
      { name: 'GATEWAY_ROUTES_2_URI', value: 'http://${authApp.outputs.fqdn}' }

      { name: 'GATEWAY_ROUTES_3_ID', value: 'deposit' }
      { name: 'GATEWAY_ROUTES_3_PATH', value: '/api/deposit/**' }
      { name: 'GATEWAY_ROUTES_3_URI', value: 'http://${depositApp.outputs.fqdn}' }
    ]
  }
}

output publicApiGatewayUrl string = 'https://${apiGateway.outputs.fqdn}'
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = acr.properties.loginServer