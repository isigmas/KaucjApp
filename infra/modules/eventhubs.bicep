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
  name: 'event-monitor'
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

resource topicUsersDeleteCommand 'Microsoft.EventHub/namespaces/eventhubs@2021-11-01' = {
  name: 'users.delete.command'
  parent: eventHubNamespace
  properties: {
    messageRetentionInDays: 1
    partitionCount: 1
  }
}

resource cgUsersDeleteCommand 'Microsoft.EventHub/namespaces/eventhubs/consumergroups@2021-11-01' = {
  name: 'users-group'
  parent: topicUsersDeleteCommand
}

resource topicUsersDeletedEvent 'Microsoft.EventHub/namespaces/eventhubs@2021-11-01' = {
  name: 'users.deleted.event'
  parent: eventHubNamespace
  properties: {
    messageRetentionInDays: 1
    partitionCount: 1
  }
}

resource cgUsersDeletedEventAuth 'Microsoft.EventHub/namespaces/eventhubs/consumergroups@2021-11-01' = {
  name: 'auth-group'
  parent: topicUsersDeletedEvent
}

resource cgUsersDeletedEventDeposit 'Microsoft.EventHub/namespaces/eventhubs/consumergroups@2021-11-01' = {
  name: 'deposit-group'
  parent: topicUsersDeletedEvent
}

resource topicOffersCompleted 'Microsoft.EventHub/namespaces/eventhubs@2021-11-01' = {
  name: 'offers.completed'
  parent: eventHubNamespace
  properties: {
    messageRetentionInDays: 1
    partitionCount: 1
  }
}

resource cgOffersCompleted 'Microsoft.EventHub/namespaces/eventhubs/consumergroups@2021-11-01' = {
  name: 'users-group'
  parent: topicOffersCompleted
}

output fqdn string = '${eventHubNamespace.name}.servicebus.windows.net:9093'
output connectionString string = listKeys(authRule.id, '2021-11-01').primaryConnectionString
