param location string
param namespaceName string

resource eventHubNamespace 'Microsoft.EventHub/namespaces@2021-11-01' = {
  name: namespaceName
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
    capacity: 1
  }
}

// Authorization rule to get connection string
resource authRule 'Microsoft.EventHub/namespaces/authorizationRules@2021-11-01' = {
  name: 'RootManageSharedAccessKey'
  parent: eventHubNamespace
  properties: {
    rights: [
      'Listen'
      'Manage'
      'Send'
    ]
  }
}

// Topics
resource topicNotificationWelcome 'Microsoft.EventHub/namespaces/eventhubs@2021-11-01' = {
  name: 'notification.mail.welcome'
  parent: eventHubNamespace
  properties: {
    messageRetentionInDays: 1
    partitionCount: 1
  }
}

resource cgNotificationWelcome 'Microsoft.EventHub/namespaces/eventhubs/consumergroups@2021-11-01' = {
  name: 'notification-group'
  parent: topicNotificationWelcome
}

resource topicNotificationReset 'Microsoft.EventHub/namespaces/eventhubs@2021-11-01' = {
  name: 'notification.mail.resetpassword'
  parent: eventHubNamespace
  properties: {
    messageRetentionInDays: 1
    partitionCount: 1
  }
}

resource cgNotificationReset 'Microsoft.EventHub/namespaces/eventhubs/consumergroups@2021-11-01' = {
  name: 'notification-group'
  parent: topicNotificationReset
}

resource topicNotificationAdmin 'Microsoft.EventHub/namespaces/eventhubs@2021-11-01' = {
  name: 'notification.admin'
  parent: eventHubNamespace
  properties: {
    messageRetentionInDays: 1
    partitionCount: 1
  }
}

resource cgNotificationAdmin 'Microsoft.EventHub/namespaces/eventhubs/consumergroups@2021-11-01' = {
  name: 'notification-group'
  parent: topicNotificationAdmin
}

resource topicSystemLogs 'Microsoft.EventHub/namespaces/eventhubs@2021-11-01' = {
  name: 'system-logs'
  parent: eventHubNamespace
  properties: {
    messageRetentionInDays: 1
    partitionCount: 1
  }
}

resource cgSystemLogs 'Microsoft.EventHub/namespaces/eventhubs/consumergroups@2021-11-01' = {
  name: 'monitor-group'
  parent: topicSystemLogs
}

resource topicUsersSync 'Microsoft.EventHub/namespaces/eventhubs@2021-11-01' = {
  name: 'users.sync'
  parent: eventHubNamespace
  properties: {
    messageRetentionInDays: 1
    partitionCount: 1
  }
}

resource cgUsersSync 'Microsoft.EventHub/namespaces/eventhubs/consumergroups@2021-11-01' = {
  name: 'users-group'
  parent: topicUsersSync
}

resource topicUsersDelete 'Microsoft.EventHub/namespaces/eventhubs@2021-11-01' = {
  name: 'users.delete'
  parent: eventHubNamespace
  properties: {
    messageRetentionInDays: 1
    partitionCount: 1
  }
}

resource cgUsersDelete 'Microsoft.EventHub/namespaces/eventhubs/consumergroups@2021-11-01' = {
  name: 'users-group'
  parent: topicUsersDelete
}

output fqdn string = '${eventHubNamespace.name}.servicebus.windows.net:9093'
output connectionString string = listKeys(authRule.id, '2021-11-01').primaryConnectionString
