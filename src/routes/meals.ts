import { FastifyInstance } from "fastify";

import { z } from "zod";
import { _knex } from "../database";
import { checkSessionIdExists } from "../middlewares/checkSessionIdExists";

export async function mealsRoutes(app: FastifyInstance) {
	app.post(
		"/:user_id",
		async (req, rep) => {

            const getUserIdSchema = z.object({
                user_id: z.coerce.number()
            })

            const {user_id} = getUserIdSchema.parse(req.params)

			const createMealSchema = z.object({
				name: z.string(),
				description: z.string(),
				made_at: z.date(),
				in_diet: z.boolean().default(true),
			});

			const newMeal = createMealSchema.safeParse(req.body);

			if (!newMeal.success) {
				return rep
					.status(400)
					.send(`Data invalid! ${newMeal.error.format}`);
			}

			const { name, description, made_at, in_diet } = newMeal.data;

			await _knex("tb_meals").insert({
                user_id,
				name,
				description,
				made_at,
				in_diet,
			});

			return rep.status(200).send();
		}
	);

	app.put(
		"/:user_id/:id",
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, rep) => {

			const getMealParamsSchema = z.object({
				id: z.coerce.number(),
                user_id: z.coerce.number()
			});

			const { id, user_id } = getMealParamsSchema.parse(req.params);

			const foundMeal = await _knex.where({ id, user_id}).first();

			if (!foundMeal) {
				return rep.status(400).send("Meal not found");
			}

			const updatedMealSchema = z.object({
				name: z.string().default(foundMeal.name),
				description: z.string(foundMeal.description),
				made_at: z.date(foundMeal.made_at),
				in_diet: z.boolean().default(true),
			});

			const updatedMeal = updatedMealSchema.safeParse(req.body);

			if (!updatedMeal.success) {
				return rep
					.status(400)
					.send(`Data invalid! ${updatedMeal.error.format}`);
			}

			const { name, description, made_at, in_diet } = updatedMeal.data;

			await foundMeal.update({
				name,
				description,
				made_at,
				in_diet,
			});

			return rep.status(200).send();
		}
	);

	app.get(
		"/:user_id/:id",
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, rep) => {

			const getMealParamsSchema = z.object({
				id: z.coerce.number(),
                user_id: z.coerce.number()
			});

			const { id, user_id } = getMealParamsSchema.parse(req.params);

            const foundMeal = await _knex.where({ id, user_id }).first();

			if (!foundMeal) {
				return rep.status(400).send("Meal not found");
			}

            const foundMealResponse = {
                id: foundMeal.id,
                name: foundMeal.name,
                description: foundMeal.description,
                made_at: foundMeal.made_at,
                in_diet: foundMeal.in_diet
            }

            return rep.status(200).send({meal: foundMealResponse})
		}
	);

    app.get("/all/:user_id", 
        async (req, rep) => {

            const getMealParamsSchema = z.object({
                user_id: z.coerce.number()
			});

			const { user_id } = getMealParamsSchema.parse(req.params);

            const meals = _knex("tb_meals")
            .where({user_id})

            return rep.status(200).send(meals)
        }
    );

    app.delete("/:user_id/:id",
        async (req, rep) => {
            const getMealParamsSchema = z.object({
				id: z.coerce.number(),
                user_id: z.coerce.number()
			});

			const { id, user_id } = getMealParamsSchema.parse(req.params);

            const foundMeal = await _knex("tb_meals").where({ id, user_id }).first();

            if (!foundMeal) {
				return rep.status(400).send("Meal not found");
			}

            await _knex("tb_meals").where({ id, user_id }).first().delete();

            return rep.status(200).send("Deleted")
        }
    )
}
