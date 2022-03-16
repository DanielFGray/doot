import { createTypeParserPreset, createPool } from 'slonik'
import { createInterceptors } from 'slonik-interceptor-preset'
export { sql } from 'slonik'

export const db = createPool(process.env.DATABASE_URL, {
  type: 'postgres',
  min: 2,
  max: 10,
  log: true,
  interceptors: [...createInterceptors({ transformFieldNames: false })],
  typeParsers: [
    ...createTypeParserPreset(),
    { name: 'timestamptz', parse: value => new Date(value) },
    { name: 'citext', parse: value => String(value) },
    { name: 'tag', parse: value => String(value) },
  ],
})
