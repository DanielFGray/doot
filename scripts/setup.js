const pg = require('pg')
const inquirer = require('inquirer')

const { DATABASE_OWNER, DATABASE_OWNER_PASSWORD, DATABASE_NAME, ROOT_DATABASE_URL, DATABASE_URL } = process.env

const RECONNECT_BASE_DELAY = 100
const RECONNECT_MAX_DELAY = 30000

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const pgPool = new pg.Pool({ connectionString: ROOT_DATABASE_URL })

async function main() {
  let attempts = 0
  while (true) {
    try {
      await pgPool.query('select true as "Connection test"')
      break
    } catch (e) {
      if (e.code === '28P01') throw e
      attempts++
      if (attempts >= 30) {
        console.log(`Database never came up, aborting :(`)
        process.exit(1)
      }
      const delay = Math.floor(
        Math.min(RECONNECT_MAX_DELAY, RECONNECT_BASE_DELAY * Math.random() * 2 ** attempts),
      )
      await sleep(delay)
    }
  }

  const client = await pgPool.connect()
  console.log(`DROP DATABASE ${DATABASE_NAME}`)
  console.log(`DROP ROLE ${DATABASE_OWNER}`)

  const { confirm } = await inquirer.prompt([
    {
      name: 'confirm',
      message: 'press y to continue:',
      type: 'confirm',
      prefix: '',
    },
  ])
  if (!confirm) process.exit()

  try {
    await client.query(`drop database if exists ${DATABASE_NAME}`)
    await client.query(`drop role if exists ${DATABASE_OWNER}`)

    await client.query(`create database ${DATABASE_NAME}`)
    console.log(`CREATE DATABASE ${DATABASE_NAME}`)

    await client.query(
      `create role ${DATABASE_OWNER} with login password '${DATABASE_OWNER_PASSWORD}' noinherit`,
    )
    console.log(`CREATE ROLE ${DATABASE_OWNER}`)

    await client.query(`grant all privileges on database ${DATABASE_NAME} to ${DATABASE_OWNER}`)
    console.log(`GRANT ${DATABASE_OWNER}`)

    const appPool = new pg.Pool({ connectionString: DATABASE_URL })
    const appClient = await appPool.connect()
    await appClient.query('create schema migrations')
    console.log('CREATE SCHEMA migrations')
    appClient.release()
  } catch (e) {
    console.error(e)
  } finally {
    client.release()
  }
}
main().then(() => pgPool.end())
