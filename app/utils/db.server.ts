import { createPool, createTypeParserPreset } from 'slonik'
import { createInterceptors } from 'slonik-interceptor-preset'
export { sql } from 'slonik'

if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')

export const db = createPool(process.env.DATABASE_URL, {
  type: 'postgres',
  min: 2,
  max: 10,
  log: true,
  interceptors: [
    ...createInterceptors({
      transformFieldNames: true
    }),
  ],
  typeParsers: [
    // ...createTypeParserPreset(),
    { name: 'citext', parse: value => String(value) },
    { name: 'tag', parse: value => String(value) },
    { name: 'timestamptz', parse: value => new Date(value) },
  ],
})
