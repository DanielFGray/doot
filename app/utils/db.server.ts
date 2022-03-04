import { createTypeParserPreset, createPool } from "slonik";
// import { createInterceptors } from 'slonik-interceptor-preset';
export { sql } from "slonik";

export const db = createPool(process.env.DATABASE_URL, {
  type: "postgres",
  min: 2,
  max: 10,
  log: true,
  interceptors: [
    // ...createInterceptors(),
  ],
  typeParsers: [
    ...createTypeParserPreset({ transformFieldNames: false }),
    { name: "timestamptz", parse: (value) => new Date(value) },
  ],
});
