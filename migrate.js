const { SlonikMigrator } = require('@slonik/migrator')
const { createPool } = require('slonik')

const slonik = createPool(process.env.DATABASE_URL)

const migrator = new SlonikMigrator({
  migrationsPath: __dirname + '/migrations',
  migrationTableName: ['migrations', 'migrations'],
  slonik,
})

migrator.runAsCLI()
