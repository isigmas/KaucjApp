@description('Microservice app name')
param appName string

@description('Service name used by Azure Developer CLI')
param azdServiceName string

@description('Resource location')
param location string

@description('Azure Container Apps Environment ID')
param environmentId string

@description('Full path to the Docker image')
param containerImage string

@description('Access from the public network')
param isExternalIngress bool = false

@description('Internal container port')
param targetPort int = 8080

@description('ACR server address (with .azurecr.io)')
param acrServer string

@description('ACR Name')
param acrUsername string

@secure()
@description('ACR Password')
param acrPassword string

@description('List of secrets for the container. Format: [{name: "nazwa", value: "wartość"}]')
param appSecrets array = []

@description('Container environment variables. Format: [{name: "X", value: "Y"} or {name: "X", secretRef: "Z"}]')
param envVars array = []

@description('CPU allocation')
param cpuCore string = '0.25'

@description('Memory allocation')
param memorySize string = '0.5Gi'

@description('Minimum container replicas (use 1 for services with @Scheduled jobs)')
param minReplicas int = 0

@description('Maximum container replicas')
param maxReplicas int = 10

@description('Allow HTTP ingress (disable for public entry points)')
param allowInsecure bool = true

var allSecrets = concat([{ name: 'acr-password', value: acrPassword }], appSecrets)

resource app 'Microsoft.App/containerApps@2023-05-01' = {
  name: appName
  location: location
  tags: {
    'azd-service-name': azdServiceName
  }
  properties: {
    managedEnvironmentId: environmentId
    configuration: {
      ingress: {
        external: isExternalIngress
        targetPort: targetPort
        allowInsecure: allowInsecure
      }
      secrets: allSecrets
      registries: [
        {
          server: acrServer
          username: acrUsername
          passwordSecretRef: 'acr-password'
        }
      ]
    }
    template: {
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
      }
      containers: [
        {
          name: appName
          image: containerImage
          env: envVars
          resources: {
            cpu: json(cpuCore)
            memory: memorySize
          }
        }
      ]
    }
  }
}

output fqdn string = app.properties.configuration.ingress.fqdn