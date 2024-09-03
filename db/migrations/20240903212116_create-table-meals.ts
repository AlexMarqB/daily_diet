import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("tb_meals", (table) => {
        table.increments('id').primary()
        
        table.integer('user_id')
        .unsigned()
        .references('id')
        .inTable('tb_users')
        .notNullable()

        table.string('name').unique()
        table.string('description')
        table.timestamp('made_at')
        table.boolean('in_diet')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("tb_meals")
}

