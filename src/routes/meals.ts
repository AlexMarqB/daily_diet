import { FastifyInstance } from "fastify";
import { z } from "zod";
import { _knex } from "../database";
import { checkSessionIdExists } from "../middlewares/checkSessionIdExists";

export async function mealsRoutes(app: FastifyInstance) {
	app.post(
		"/",
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, rep) => {
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

			const { session_id } = req.cookies

			const { name, description, made_at, in_diet } = newMeal.data;

			// Aqui, você pode inserir a refeição diretamente sem precisar do user_id
			await _knex("tb_meals").insert({
				name,
				description,
				made_at: made_at.toISOString(),
				in_diet,
				session_id
			});

			return rep.status(200).send();
		}
	);

	app.put(
		"/:id",
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, rep) => {
			const getMealParamsSchema = z.object({
				id: z.coerce.number(),
			});

			const { id } = getMealParamsSchema.parse(req.params);

			const foundMeal = await _knex("tb_meals").where({ id }).first();

			if (!foundMeal) {
				return rep.status(400).send("Meal not found");
			}

			const updatedMealSchema = z.object({
				name: z.string().default(foundMeal.name),
				description: z.string().default(foundMeal.description),
				made_at: z.date().default(new Date(foundMeal.made_at)),
				in_diet: z.boolean().default(foundMeal.in_diet),
			});

			const updatedMeal = updatedMealSchema.safeParse(req.body);

			if (!updatedMeal.success) {
				return rep
					.status(400)
					.send(`Data invalid! ${updatedMeal.error.format}`);
			}

			const { name, description, made_at, in_diet } = updatedMeal.data;

			await _knex("tb_meals").where({ id }).update({
				name,
				description,
				made_at: made_at.toISOString(),
				in_diet,
			});

			return rep.status(200).send();
		}
	);

	app.get(
		"/:id",
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, rep) => {
			const getMealParamsSchema = z.object({
				id: z.coerce.number(),
			});

			const { id } = getMealParamsSchema.parse(req.params);

			const foundMeal = await _knex("tb_meals").where({ id }).first();

			if (!foundMeal) {
				return rep.status(400).send("Meal not found");
			}

			const foundMealResponse = {
				id: foundMeal.id,
				name: foundMeal.name,
				description: foundMeal.description,
				made_at: foundMeal.made_at,
				in_diet: foundMeal.in_diet,
			};

			return rep.status(200).send({ meal: foundMealResponse });
		}
	);

	app.get("/all", { preHandler: [checkSessionIdExists] }, async (req, rep) => {
		const meals = await _knex("tb_meals").select();

		return rep.status(200).send(meals);
	});

	app.delete(
		"/:id",
		{ preHandler: [checkSessionIdExists] },
		async (req, rep) => {
			const getMealParamsSchema = z.object({
				id: z.coerce.number(),
			});

			const { id } = getMealParamsSchema.parse(req.params);

			const foundMeal = await _knex("tb_meals").where({ id }).first();

			if (!foundMeal) {
				return rep.status(400).send("Meal not found");
			}

			await _knex("tb_meals").where({ id }).delete();

			return rep.status(200).send();
		}
	);
}
