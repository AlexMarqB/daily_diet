import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("tb_meals", (table) => {
        table.increments('id').primary()
        table.uuid('session_id').index()
        table.string('name').unique()
        table.string('description')
        table.timestamp('made_at')
        table.boolean('in_diet')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("tb_meals")
}

