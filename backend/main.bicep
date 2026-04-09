@description('Lokalizacja dla wszystkich zasobów')
param location string = resourceGroup().location

@description('Nazwa Twojego Azure Container Registry (bez .azurecr.io)')
param acrName string

@description('Użytkownik administratora bazy danych')
param dbUser string = 'postgres_admin'

@secure()
@description('Hasło do bazy danych')
param dbPassword string

@secure()
@description('Sekret IT do serwisów')
param itSecret string

@secure()
@description('Sekret JWT do Gatewaya i Autoryzacji')
param jwtSecret string

@secure()
@description('Sól do haseł w serwisie Auth')
param passwordSalt string

@description('Tag obrazu Docker do wdrożenia')
param imageTag string = 'latest'

resource acr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' existing = {
  name: acrName
}

resource pgServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: 'psql-cluster-${uniqueString(resourceGroup().id)}'
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

resource offersDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = { parent: pgServer, name: 'offers_db' }
resource usersDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = { parent: pgServer, name: 'users_db' }
resource authDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = { parent: pgServer, name: 'auth_db' }

resource acaEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'microservices-env'
  location: location
  properties: {}
}

resource offersApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'offers-service'
  location: location
  properties: {
    managedEnvironmentId: acaEnv.id
    configuration: {
      ingress: { external: false, targetPort: 8080, allowInsecure: true }
      secrets: [
        { name: 'db-password', value: dbPassword }
        { name: 'acr-password', value: acr.listCredentials().passwords[0].value }
      ]
      registries: [
        {
          server: acr.properties.loginServer
          username: acr.name
          passwordSecretRef: 'acr-password'
        }
      ]
    }
    template: {
      containers: [{
        name: 'offers-service'
        image: '${acr.properties.loginServer}/offers-service:${imageTag}'
        env: [
          { name: 'SPRING_DATASOURCE_URL', value: 'jdbc:postgresql://${pgServer.properties.fullyQualifiedDomainName}:5432/offers_db?sslmode=require' }
          { name: 'SPRING_DATASOURCE_USERNAME', value: dbUser }
          { name: 'SPRING_DATASOURCE_PASSWORD', secretRef: 'db-password' }
          { name: 'SPRING_JPA_HIBERNATE_DDL_AUTO', value: 'update' }
        ]
      }]
    }
  }
  dependsOn: [ offersDb ]
}

resource usersApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'users-service'
  location: location
  properties: {
    managedEnvironmentId: acaEnv.id
    configuration: {
      ingress: { external: false, targetPort: 8080, allowInsecure: true }
      secrets: [
        { name: 'db-password', value: dbPassword }
        { name: 'it-secret', value: itSecret }
        { name: 'acr-password', value: acr.listCredentials().passwords[0].value }
      ]
      registries: [
        {
          server: acr.properties.loginServer
          username: acr.name
          passwordSecretRef: 'acr-password'
        }
      ]
    }
    template: {
      containers: [{
        name: 'users-service'
        image: '${acr.properties.loginServer}/users-service:${imageTag}'
        env: [
          { name: 'IT_SECRET', secretRef: 'it-secret' }
          { name: 'SPRING_DATASOURCE_URL', value: 'jdbc:postgresql://${pgServer.properties.fullyQualifiedDomainName}:5432/users_db?sslmode=require' }
          { name: 'SPRING_DATASOURCE_USERNAME', value: dbUser }
          { name: 'SPRING_DATASOURCE_PASSWORD', secretRef: 'db-password' }
          { name: 'SPRING_JPA_HIBERNATE_DDL_AUTO', value: 'update' }
        ]
      }]
    }
  }
  dependsOn: [ usersDb ]
}

resource authApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'auth-service'
  location: location
  properties: {
    managedEnvironmentId: acaEnv.id
    configuration: {
      ingress: { external: false, targetPort: 8080, allowInsecure: true }
      secrets: [
        { name: 'db-password', value: dbPassword }
        { name: 'it-secret', value: itSecret }
        { name: 'jwt-secret', value: jwtSecret }
        { name: 'password-salt', value: passwordSalt }
        { name: 'acr-password', value: acr.listCredentials().passwords[0].value }
      ]
      registries: [
        {
          server: acr.properties.loginServer
          username: acr.name
          passwordSecretRef: 'acr-password'
        }
      ]
    }
    template: {
      containers: [{
        name: 'auth-service'
        image: '${acr.properties.loginServer}/auth-service:${imageTag}'
        env: [
          { name: 'SPRING_DATASOURCE_URL', value: 'jdbc:postgresql://${pgServer.properties.fullyQualifiedDomainName}:5432/auth_db?sslmode=require' }
          { name: 'SPRING_DATASOURCE_USERNAME', value: dbUser }
          { name: 'SPRING_DATASOURCE_PASSWORD', secretRef: 'db-password' }
          { name: 'SPRING_JPA_HIBERNATE_DDL_AUTO', value: 'update' }
          { name: 'IT_SECRET', secretRef: 'it-secret' }
          { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
          { name: 'PASSWORD_SALT', secretRef: 'password-salt' }
          { name: 'USER_SERVICE_URL', value: 'http://${usersApp.properties.configuration.ingress.fqdn}' }
        ]
      }]
    }
  }
  dependsOn: [ authDb ]
}

resource apiGateway 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'api-gateway'
  location: location
  properties: {
    managedEnvironmentId: acaEnv.id
    configuration: {
      ingress: { external: true, targetPort: 8080 }
      secrets: [
        { name: 'jwt-secret', value: jwtSecret }
        { name: 'acr-password', value: acr.listCredentials().passwords[0].value }
      ]
      registries: [
        {
          server: acr.properties.loginServer
          username: acr.name
          passwordSecretRef: 'acr-password'
        }
      ]
    }
    template: {
      containers: [{
        name: 'api-gateway'
        image: '${acr.properties.loginServer}/api-gateway:${imageTag}'
        env: [
          { name: 'JWT_SECRET', secretRef: 'jwt-secret' }

          { name: 'GATEWAY_ROUTES_0_ID', value: 'users' }
          { name: 'GATEWAY_ROUTES_0_PATH', value: '/api/user/**' }
          { name: 'GATEWAY_ROUTES_0_URI', value: 'http://${usersApp.properties.configuration.ingress.fqdn}' }

          { name: 'GATEWAY_ROUTES_1_ID', value: 'offers' }
          { name: 'GATEWAY_ROUTES_1_PATH', value: '/api/offer/**' }
          { name: 'GATEWAY_ROUTES_1_URI', value: 'http://${offersApp.properties.configuration.ingress.fqdn}' }

          { name: 'GATEWAY_ROUTES_2_ID', value: 'auth' }
          { name: 'GATEWAY_ROUTES_2_PATH', value: '/api/auth/**' }
          { name: 'GATEWAY_ROUTES_2_URI', value: 'http://${authApp.properties.configuration.ingress.fqdn}' }
        ]
      }]
    }
  }
}

output publicApiGatewayUrl string = 'https://${apiGateway.properties.configuration.ingress.fqdn}'