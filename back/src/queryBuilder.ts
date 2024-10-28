import knex from "knex";
export const qb = knex({client: "sqlite3", useNullAsDefault: true});
