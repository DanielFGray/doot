import { createPool } from 'slonik';
export { sql } from 'slonik'

export const db = createPool(process.env.DATABASE_URL);
