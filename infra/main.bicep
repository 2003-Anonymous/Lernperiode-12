@description('Region aller Ressourcen (vom Studenten-Abo erlaubt)')
param location string
 
@description('Name der Web-App, Teil der URL')
param appName string
 
@description('Docker-Image, z.B. ghcr.io/2003-anonymous/lernperiode-12:0.2.0')
param image string
 
@secure()
@description('Passwort des Datenbank-Administrators')
param dbPassword string
 
var dbUser = 'casinoadmin'
var dbName = 'Casino'
 
// Rechenleistung für die Web-App (Linux, Basic B1)
resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: '${appName}-plan'
  location: location
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}
 
// Datenbank-Server und Datenbank
resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: '${appName}-sql'
  location: location
  properties: {
    administratorLogin: dbUser
    administratorLoginPassword: dbPassword
    minimalTlsVersion: '1.2'
  }
}
 
// Erlaubt Verbindungen von Azure-Diensten (also von der Web-App)
resource allowAzure 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}
 
resource db 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: dbName
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
}
 
// Web-App, die das Docker-Image ausführt
resource app 'Microsoft.Web/sites@2023-12-01' = {
  name: appName
  location: location
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|${image}'
      healthCheckPath: '/health'
      appSettings: [
        { name: 'WEBSITES_PORT', value: '8080' }
        { name: 'DOCKER_REGISTRY_SERVER_URL', value: 'https://ghcr.io' }
        { name: 'MigrateOnStartup', value: 'true' }
      ]
      connectionStrings: [
        {
          name: 'CasinoContext'
          type: 'SQLAzure'
          connectionString: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Database=${dbName};User ID=${dbUser};Password=${dbPassword};Encrypt=True;TrustServerCertificate=False;'
        }
      ]
    }
  }
}
 
output url string = 'https://${app.properties.defaultHostName}'
