import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("tb_users", (table) => {
        table.uuid('id').primary()
        table.string('email').unique()
        
    })
}


export async function down(knex: Knex): Promise<void> {
}

