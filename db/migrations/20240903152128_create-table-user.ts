import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("tb_users", (table) => {
        table.increments('id').primary()
        table.string('name')
        table.string('email').unique()
        table.uuid('session_id')
    })
}


export async function down(knex: Knex): Promise<void> {
    knex.schema.dropTable("tb_users")
}

